package com.dharaksha.server.service;

import com.dharaksha.server.dto.MouldFillingResponse;
import com.dharaksha.server.model.BagInoculationData;
import com.dharaksha.server.model.GrowthBatchData;
import com.dharaksha.server.model.Chamber;
import com.dharaksha.server.model.MouldFillingData;
import com.dharaksha.server.repository.BagIncubationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.context.ApplicationEventPublisher;
import com.dharaksha.server.event.AlertEvent;

import com.dharaksha.server.util.DateFilterUtil;
import com.dharaksha.server.util.SecurityUtil;
import com.dharaksha.server.util.MouldUtils;
import com.dharaksha.server.dto.mouldFilling.*;
import com.dharaksha.server.dto.batch.CycleEvent;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j  
public class MouldFillingService {

    // mongodb
    private final MongoTemplate mongoTemplate;
    private final SecurityUtil securityUtil;
    private final S3Service s3Service;
    private final com.dharaksha.server.repository.GrowthBatchRepository growthBatchRepository;
    private final BagIncubationRepository bagIncubationRepository;
    private final ValidationSettingService validationSettingService;
    private final ApplicationEventPublisher eventPublisher;

    private Criteria buildFieldCriteria(String typeOfMould, String filledBy, String bagId, String mouldId) {
        List<Criteria> parts = new java.util.ArrayList<>();
        if (typeOfMould != null && !typeOfMould.isBlank())
            parts.add(Criteria.where("typeOfMould").is(typeOfMould));
        if (filledBy != null && !filledBy.isBlank())
            parts.add(Criteria.where("filledBy").is(filledBy));
        if (bagId != null && !bagId.isBlank())
            parts.add(Criteria.where("bagId").is(bagId));
        if (mouldId != null && !mouldId.isBlank())
            parts.add(Criteria.where("mouldId").is(mouldId));
        return parts.isEmpty() ? new Criteria() : new Criteria().andOperator(parts.toArray(new Criteria[0]));
    }

    // ! GET api/v2s/mould-filling/get-data
    public MouldFillingResponse getMouldData(String startDate, String endDate,
            String typeOfMould, String filledBy, String bagId, String mouldId,
            int page, int resultPerPage) {

        boolean hasDate = DateFilterUtil.hasDateFilter(startDate, endDate);
        Criteria dateCriteria = hasDate ? DateFilterUtil.buildDateCriteria(startDate, endDate, "fillingDate")
                : new Criteria();
        Criteria fieldCriteria = buildFieldCriteria(typeOfMould, filledBy, bagId, mouldId);

        Criteria criteria = new Criteria().andOperator(dateCriteria, fieldCriteria);

        long totalInCollection = mongoTemplate.count(new Query(), MouldFillingData.class);
        long totalFiltered = mongoTemplate.count(new Query(criteria), MouldFillingData.class);

        long skip = (long) (page - 1) * resultPerPage;

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.lookup("baginoculations", "previousStatusTillBagInoculation", "_id",
                        "previousStatusTillBagInoculation"),
                Aggregation.unwind("$previousStatusTillBagInoculation", true),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "fillingDate")),
                Aggregation.skip(skip), // start ke kuch skip karna hai based on the result per page ((9-1)*50)
                Aggregation.limit(resultPerPage) // after skiping show only jitna pucha gaya hai.
        );

        List<MouldFillingData> data = mongoTemplate
                .aggregate(aggregation, "mouldfillings", MouldFillingData.class)
                .getMappedResults();

        // Guard: old documents pre-dating mouldTransferHistory will have null here.
        // Normalise to an empty list so callers never receive null.
        data.forEach(this::safeMouldTransferHistory);

        int totalPages = (int) Math.ceil((double) totalFiltered / resultPerPage);

        return new MouldFillingResponse(
                true,
                hasDate ? "Mould Filling Data (date filtered)" : "Mould Filling Data (recent " + resultPerPage + ")",
                totalInCollection,
                totalFiltered,
                data.size(),
                resultPerPage,
                totalPages,
                data);
    }

    /**
     * Ensures {@code mouldTransferHistory} is never {@code null} on a returned
     * document.
     * Old MongoDB documents that predate this field will deserialise it as
     * {@code null};
     * this guard replaces null with an empty list so service and controller code
     * can
     * safely iterate without a NullPointerException.
     */
    private void safeMouldTransferHistory(MouldFillingData doc) {
        if (doc.getMouldTransferHistory() == null) {
            doc.setMouldTransferHistory(Collections.emptyList());
        }
    }

    // TODO: from here new thing is i am doing......

    // ! /filled-Mould-and-placed
    @Transactional
    public void createFilledNewMould(FilledNewMouldRequest request) {

        String bagId = request.getBagId();
        String filledBy = request.getFilledBy();
        String typeOfMould = request.getTypeOfMould();
        String growthChamberNo = request.getGrowthChamberNo();
        String batchId = request.getBatchId();

        String transferBy = securityUtil.getCurrentUser();

        if (transferBy == null) {
            transferBy = "SYSTEM";
        }

        // ? Check for duplicate mould IDs
        MouldUtils.checkDuplicateMoulds(request.getMould(), mongoTemplate);

        // ? Bag Check Validation (controlled by MOULD_FILLING_BAG_CHECK setting)
        boolean bagCheckEnabled = validationSettingService.isEnabled(
                ValidationSettingService.MOULD_FILLING_BAG_CHECK, true);

        if (bagCheckEnabled) {
            // 1. Check if the bag is rejected in bagincubations
            bagIncubationRepository.findByBagId(bagId).ifPresent(rejected -> {
                throw new IllegalArgumentException(
                        "Bag ID \"" + rejected.getBagId() + "\" is already Rejected in Bag Incubation department.");
            });

            // 2. Check if the bagId exists in baginoculations
            Query bagExistQuery = new Query(Criteria.where("bagId").is(bagId));
            BagInoculationData bagRecord = mongoTemplate.findOne(bagExistQuery, BagInoculationData.class);
            if (bagRecord == null) {
                throw new IllegalArgumentException(
                        "Bag ID \"" + bagId + "\" does not exist in Bag Inoculation records.");
            }
        } else {
            log.info("Bag check is DISABLED by admin settings. Skipping Bag Inoculation/Incubation validation.");
        }

        GrowthBatchData batchData = null;

        // ? must have batchId
        if (batchId != null && !batchId.isBlank()) {

            Query query = new Query(Criteria.where("batchId").is(batchId));

            // ? find the batch from the growthbatches collection
            batchData = mongoTemplate.findOne(query, GrowthBatchData.class);

            // ? if the bactch is not found
            // ! for the first time filling this
            if (batchData == null) {

                // ? building new batch data
                batchData = new GrowthBatchData();
                batchData.setHumidifierNo(growthChamberNo);
                batchData.setBatchId(batchId);
                batchData.setDepartment("mould-filling");
                batchData.setPlacingTime(new Date());
                batchData.setPlacedBy(filledBy); // !

                // ? Create new batch if batch is not found
                // TODO: 1st write
                mongoTemplate.save(batchData);

                // ? Update the chamber with the new batch reference
                if (growthChamberNo != null && !growthChamberNo.isBlank()) {
                    Query chamberQuery = new Query(Criteria.where("serialNo").is(growthChamberNo));
                    Chamber chamber = mongoTemplate.findOne(chamberQuery, Chamber.class);
                    if (chamber != null) {

                        Chamber.BatchReference ref = new Chamber.BatchReference();

                        ref.setBatchId(batchId);
                        ref.setId(batchData.getId());

                        if (chamber.getActiveBatches() == null) {
                            chamber.setActiveBatches(new ArrayList<>());
                        }
                        chamber.getActiveBatches().add(ref);
                        // ? add the created batch in the chamber
                        // TODO: 2nd write
                        // if (true) {
                        // throw new RuntimeException("Simulating error for transaction testing!");
                        // }
                        mongoTemplate.save(chamber);
                    }
                }
            }
        }

        // ? if batch is already marked as filled
        if (batchData != null && batchData.getMarkAsFilledTime() != null) {
            throw new IllegalArgumentException("Cannot place more moulds. This batch is already marked as filled.");
        }

        // ? bag deparment linking....
        Query bagQuery = new Query(Criteria.where("bagId").is(bagId));
        BagInoculationData previousStatusTillBagInoculation = mongoTemplate.findOne(bagQuery, BagInoculationData.class);

        // ? if not found, use default fallback document
        // ! comment out for link and not linking
        if (previousStatusTillBagInoculation == null) {
            previousStatusTillBagInoculation = mongoTemplate.findById("67612d5180bd61aa82530cb0",
                    BagInoculationData.class);
        }

        // ? build mould data
        List<MouldFillingData> mouldsToSave = new ArrayList<>();

        for (FilledNewMouldRequest.MouldItem item : request.getMould()) {

            // ? Building new item for every mouldId
            MouldFillingData data = new MouldFillingData();

            // ? link to previous status
            data.setPreviousStatusTillBagInoculation(previousStatusTillBagInoculation);

            // ? basic info
            data.setBagId(bagId);
            data.setFilledBy(filledBy); // !
            data.setTypeOfMould(typeOfMould);
            data.setMouldId(item.getMouldId());
            data.setFillingDate(new Date());

            if (batchData != null) {
                // ? batch history of the mould
                MouldTransferRecord record = new MouldTransferRecord();
                record.setGrowthChamberNo(growthChamberNo);
                record.setBatchId(batchId);

                // ! from the above
                record.setBatchInfo(batchData);
                record.setScanInTime(new Date());
                record.setTransferBy(transferBy);

                List<MouldTransferRecord> history = new ArrayList<>();
                history.add(record);

                data.setMouldTransferHistory(history);
            }

            mouldsToSave.add(data);
        }

        // ? Save all moulds at once
        if (!mouldsToSave.isEmpty()) {
            // TODO: 3rd write
            mongoTemplate.insertAll(mouldsToSave);
        }

    }

    // !/moulds-by-batch : In the batch how many mould are placed....
    public List<MouldFillingData> getMouldsByBatchId(String batchId) {
        Query query = new Query(Criteria.where("mouldTransferHistory.batchId").is(batchId));
        List<MouldFillingData> moulds = mongoTemplate.find(query, MouldFillingData.class);

        // Sort in memory based on scanInTime for the specific batch
        moulds.sort((m1, m2) -> {
            Date d1 = MouldUtils.getScanInTimeForBatch(m1, batchId);
            Date d2 = MouldUtils.getScanInTimeForBatch(m2, batchId);
            if (d1 == null && d2 == null)
                return 0;
            if (d1 == null)
                return 1;
            if (d2 == null)
                return -1;
            return d1.compareTo(d2); // Earliest first
        });

        return moulds;
    }

    // ! /batch-info : Get the batch info....
    public GrowthBatchData getBatchInfoByBatchId(String batchId) {
        Query query = new Query(Criteria.where("batchId").is(batchId));
        return mongoTemplate.findOne(query, GrowthBatchData.class);
    }

  

    // ! mark filled and start the first cycle...
    @Transactional
    public void markBatchFilled(String batchId, Double cycleTime) {
        Query batchQuery = new Query(Criteria.where("batchId").is(batchId));

        GrowthBatchData batch = mongoTemplate.findOne(batchQuery, GrowthBatchData.class);

        if (batch == null) {
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }

        // ?mark filled
        batch.setMarkAsFilledTime(new Date());

        List<CycleEvent> cycleEvents = batch.getCycleEvents();

        if (cycleEvents == null) {
            cycleEvents = new java.util.ArrayList<>();
        }

        // ? collect first cycle data
        CycleEvent event = new CycleEvent();

        event.setOpeningTime(new Date());
        event.setCycleTime(cycleTime);
        event.setCycleNumber(1);
        
        String currentUser = securityUtil.getCurrentUser();
        event.setStartedBy(currentUser != null ? currentUser : "SYSTEM");

        cycleEvents.add(event);
        batch.setCycleEvents(cycleEvents);

        // ? saving new batch info
        // ? saving with markAsFilled time and first cycle info....
        // TODO: 1st write.
        mongoTemplate.save(batch);

        if (batch.getHumidifierNo() != null) {
            // ? change the status of the chamber to filledCompletely.
            Query chamberQuery = new Query(Criteria.where("serialNo").is(batch.getHumidifierNo()));
            Chamber chamber = mongoTemplate.findOne(chamberQuery, Chamber.class);
            if (chamber != null) {
                chamber.setStatus("filledCompletely");
                // TODO: 2nd write.
                mongoTemplate.save(chamber);
            }
        }
    }

    // ! finish the batch
    @Transactional
    public void finishBatch(String batchId, Integer growthType,
            List<org.springframework.web.multipart.MultipartFile> images) throws java.io.IOException {
        if (batchId == null || batchId.isBlank()) {
            log.error("Batch ID is required");
            throw new IllegalArgumentException("Batch ID is required");
        }
        if (growthType == null || growthType < 1 || growthType > 100) {
            log.error("Invalid growth type: {}", growthType);
            throw new IllegalArgumentException("Growth type must be between 1 and 100");
        }
        if (images == null || images.isEmpty()) {
            log.error("At least one image is required");
            throw new IllegalArgumentException("At least one image is required");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);
        if (batch == null) {
            log.error("Batch not found: {}", batchId);
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }
        if (batch.getRemovedTime() != null) {
            log.error("Batch has already been removed/finished: {}", batchId);
            throw new IllegalArgumentException("Batch has already been removed/finished");
        }

        // 1. Upload images to S3
        List<String> imageUrls = s3Service.uploadFiles(images);
        batch.setImages(imageUrls);

        // 2. Set growth type and removed time
        batch.setGrowthType(growthType);
        Date now = new Date();
        batch.setRemovedTime(now);
        batch.setRemovedBy("SYSTEM");

        // TODO: 1st write
        // ? images, growthType,removedTime;
        growthBatchRepository.save(batch);

        // 4. Update Chamber status to empty and remove batch from activeBatches
        Query query = new Query(Criteria.where("activeBatches.batchId").is(batchId));
        Chamber chamber = mongoTemplate.findOne(query, Chamber.class);
        if (chamber != null) {
            chamber.setStatus("empty");
            if (chamber.getActiveBatches() != null) {
                chamber.getActiveBatches().removeIf(ref -> batchId.equals(ref.getBatchId()));
            }

            // TODO: 2nd write
            // ? status, activeBatches
            log.info("Marked batch as finished in chamber: {}", chamber.getSerialNo());
            mongoTemplate.save(chamber);
        }

        // 5. Mark the outTime for all moulds currently in this growth batch
        Query mouldQuery = new Query(Criteria.where("mouldTransferHistory.batchId").is(batchId));
        List<MouldFillingData> moulds = mongoTemplate.find(mouldQuery, MouldFillingData.class);
        // MouldFillingData: all the mould items
        for (MouldFillingData mould : moulds) {

            // for the one mould find the batch history in that batch history
            // find the batchId and set the outTime
            List<MouldTransferRecord> history = mould.getMouldTransferHistory();

            if (history == null || history.isEmpty()) {
                // if the history is empty then move for the next mould
                continue;
            }

            boolean updated = false;

            for (MouldTransferRecord record : history) {
                // MouldTransferRecord : this is the array
                if (batchId.equals(record.getBatchId()) && record.getOutTime() == null) {
                    // if the batchId is equal to the input batchId
                    record.setOutTime(now);
                    record.setTransferBy("SYSTEM");
                    updated = true;
                    // go out of the inner loop.
                    break;
                }
            }

            if (updated) {
                // TODO: 3rd write
                // ? for mould added the outtime for given batchId
                log.info("Marked out time for mould: {}", mould.getMouldId());
                mongoTemplate.save(mould);
            }
        }
    }

      // ! /batch-details : Get combined batch info and mould data
    public BatchDetailResponse getBatchDetails(String batchId) {
        GrowthBatchData batchInfo = getBatchInfoByBatchId(batchId);
        if (batchInfo != null && batchInfo.getImages() != null) {
            List<String> presignedImages = new java.util.ArrayList<>();
            for (String img : batchInfo.getImages()) {
                presignedImages.add(s3Service.generatePresignedUrl(img));
            }
            batchInfo.setImages(presignedImages);
        }
        List<MouldFillingData> moulds = getMouldsByBatchId(batchId);
        
        java.util.Map<String, Long> mouldTypeCounts = moulds.stream()
                .filter(m -> m.getTypeOfMould() != null && !m.getTypeOfMould().isBlank())
                .collect(java.util.stream.Collectors.groupingBy(
                        MouldFillingData::getTypeOfMould,
                        java.util.stream.Collectors.counting()
                ));

        return new BatchDetailResponse(batchInfo, moulds, mouldTypeCounts);
    }

    // This method is used when a mould is broken or rejected, marking it in the database and letting the system know.
    @Transactional
    public void rejectMould(String mouldId, String reason) {
        // Look up the mould in the database using its ID card number.
        Query query = new Query(Criteria.where("mouldId").is(mouldId));
        MouldFillingData mould = mongoTemplate.findOne(query, MouldFillingData.class);
        if (mould == null) {
            throw new IllegalArgumentException("Mould not found with ID: " + mouldId);
        }

        // Mark the mould as rejected and save when, why, and who rejected it.
        mould.setMouldRejected(true);
        mould.setMouldRejectionReason(reason);
        mould.setMouldRejectionDate(new Date());
        
        String currentUser = securityUtil.getCurrentUser();
        mould.setMouldRejectedBy(currentUser != null ? currentUser : "SYSTEM");

        // Save the updated mould information.
        mongoTemplate.save(mould);

        // Build a warning alert message.
        String subject = "Mould Rejection Alert - ID: " + mouldId;
        String alertMessage = String.format("Mould with ID '%s' of type '%s' has been rejected.\nRejected By: %s\nReason: %s",
                mouldId, mould.getTypeOfMould() != null ? mould.getTypeOfMould() : "Unknown", mould.getMouldRejectedBy(), reason);
        
        // This line shouts: "Oh no! A mould was rejected! Please send a system warning email to the admins!"
        // The server listens for this and sends the alert in the background.
        eventPublisher.publishEvent(new AlertEvent(this, "MOULD_REJECTION", subject, alertMessage, "WARNING"));
    }
}

