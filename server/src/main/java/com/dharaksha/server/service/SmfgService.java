package com.dharaksha.server.service;

import com.dharaksha.server.dto.smfg.PlaceSmfgRequest;
import com.dharaksha.server.dto.smfg.SmfgTransferHistory;
import com.dharaksha.server.model.SmFgData;
import com.dharaksha.server.model.GrowthBatchData;
import com.dharaksha.server.model.Chamber;
import com.dharaksha.server.model.MouldFillingData;
import com.dharaksha.server.repository.SmFgDataRepository;
import com.dharaksha.server.repository.MouldFillingRepository;
import com.dharaksha.server.repository.GrowthBatchRepository;
import com.dharaksha.server.repository.ChamberRepository;
import com.dharaksha.server.util.SecurityUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dharaksha.server.dto.smfg.SmfgBatchDetailResponse;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmfgService {

    private final MongoTemplate mongoTemplate;
    private final SmFgDataRepository smFgDataRepository;
    private final MouldFillingRepository mouldFillingRepository;
    private final GrowthBatchRepository growthBatchRepository;
    private final ChamberRepository chamberRepository;
    private final SecurityUtil securityUtil;
    private final S3Service s3Service;
    private final ValidationSettingService validationSettingService;

    // ! ==> Places scanned SMFG moulds into a growth batch.

    /**
     * Helper to validate that none of the scanned mould IDs are already present in
     * the SMFG records.
     */
    private void validateMouldsNotAlreadyInSmfgDatabase(List<String> smFgIds) {
        List<SmFgData> existing = smFgDataRepository.findBySmFgIdIn(smFgIds);
        if (!existing.isEmpty()) {
            List<String> existingIds = new ArrayList<>();
            for (SmFgData doc : existing) {
                existingIds.add(doc.getSmFgId());
            }
            throw new IllegalArgumentException("The following mould IDs are already present in the SMFG records: "
                    + String.join(", ", existingIds));
        }
    }

    /**
     * Helper to validate that all scanned mould IDs exist in the Mould Filling
     * records.
     * Returns a map of mould ID -> MouldFillingData for quick access.
     */
    private Map<String, MouldFillingData> validateMouldsExistInPreviousDatabase(List<String> smFgIds) {
        List<MouldFillingData> existing = mouldFillingRepository.findByMouldIdIn(smFgIds);

        Map<String, MouldFillingData> existingMap = new HashMap<>();
        for (MouldFillingData m : existing) {
            existingMap.put(m.getMouldId(), m);
        }

        List<String> nonExistingIds = new ArrayList<>();
        for (String id : smFgIds) {
            if (!existingMap.containsKey(id)) {
                nonExistingIds.add(id);
            }
        }

        if (!nonExistingIds.isEmpty()) {
            throw new IllegalArgumentException(
                    "The following mould IDs do not exist in the previous database (Mould Filling records): "
                            + String.join(", ", nonExistingIds));
        }

        return existingMap;
    }

    @Transactional
    public void placeSmfg(PlaceSmfgRequest request) {
        String growthChamberNo = request.getGrowthChamberNo();
        String batchId = request.getBatchId();
        String placedBy = securityUtil.getCurrentUser();
        if (placedBy == null) {
            placedBy = "SYSTEM";
        }

        log.info("Placing SMFG pieces to growth chamber: {}, batch: {}, by: {}",
                growthChamberNo, batchId, placedBy);

        // 1. Extract scanned mould IDs
        List<String> scannedMouldIds = new ArrayList<>();
        if (request.getMould() != null) {
            for (PlaceSmfgRequest.MouldItem item : request.getMould()) {
                if (item.getMouldId() != null && !item.getMouldId().isBlank()) {
                    scannedMouldIds.add(item.getMouldId());
                }
            }
        }

        if (scannedMouldIds.isEmpty()) {
            throw new IllegalArgumentException("No scanned moulds provided for placement.");
        }

        // 2. Perform validations using helpers
        // ? aleardy scanned...
        validateMouldsNotAlreadyInSmfgDatabase(scannedMouldIds);

        // ? Mould Filling Check (controlled by HUMIDIFIER_MOULD_FILLING_CHECK setting)
        boolean mouldCheckEnabled = validationSettingService.isEnabled(
                ValidationSettingService.HUMIDIFIER_MOULD_FILLING_CHECK, true);

        Map<String, MouldFillingData> mouldFillingMap;
        if (mouldCheckEnabled) {
            // Check that moulds exist in mouldfillings collection
            mouldFillingMap = validateMouldsExistInPreviousDatabase(scannedMouldIds);
        } else {
            log.info("Mould filling check is DISABLED by admin settings. Skipping Mould Filling validation for humidifier placement.");
            // Build map from whatever exists (may be empty/partial)
            List<MouldFillingData> existing = mouldFillingRepository.findByMouldIdIn(scannedMouldIds);
            mouldFillingMap = new HashMap<>();
            for (MouldFillingData m : existing) {
                mouldFillingMap.put(m.getMouldId(), m);
            }
        }

        // 3. Find or create GrowthBatchData
        GrowthBatchData batchData = null;
        if (batchId != null && !batchId.isBlank()) {
            batchData = growthBatchRepository.findByBatchId(batchId);

            if (batchData == null) {
                log.info("Batch {} not found. Creating new growth batch.", batchId);
                batchData = new GrowthBatchData();
                batchData.setHumidifierNo(growthChamberNo);
                batchData.setBatchId(batchId);
                batchData.setDepartment("humidifer");
                batchData.setPlacingTime(new Date());
                batchData.setPlacedBy(placedBy);

                mongoTemplate.save(batchData);

                if (growthChamberNo != null && !growthChamberNo.isBlank()) {
                    Chamber chamber = chamberRepository.findBySerialNo(growthChamberNo);
                    if (chamber != null) {
                        Chamber.BatchReference ref = new Chamber.BatchReference();
                        ref.setBatchId(batchId);
                        ref.setId(batchData.getId());

                        if (chamber.getActiveBatches() == null) {
                            chamber.setActiveBatches(new ArrayList<>());
                        }
                        chamber.getActiveBatches().add(ref);
                        mongoTemplate.save(chamber);
                        log.info("Added batch reference {} to chamber {}", batchId, growthChamberNo);
                    }
                }
            }
        }

        if (batchData != null && batchData.getMarkAsFilledTime() != null) {
            throw new IllegalArgumentException("Cannot place more moulds. This batch is already marked as filled.");
        }

        // 4. Build and collect SmFgData records to save in bulk
        List<SmFgData> smFgDocsToSave = new ArrayList<>();

        for (String smFgId : scannedMouldIds) {
            // mouldFillingMap get from the helper...
            MouldFillingData mouldFilling = mouldFillingMap.get(smFgId);

            SmFgData smFgDoc = new SmFgData();
            smFgDoc.setSmFgId(smFgId);
            smFgDoc.setPrevStationInfo(mouldFilling);

            List<SmfgTransferHistory> history = new ArrayList<>();
            SmfgTransferHistory transferRecord = new SmfgTransferHistory();
            transferRecord.setHumidifierNo(growthChamberNo);
            transferRecord.setBatchId(batchId);
            transferRecord.setBatchInfo(batchData);
            transferRecord.setScanInTime(new Date());
            transferRecord.setTransferBy(placedBy);

            history.add(transferRecord);
            smFgDoc.setSmfgTransferHistory(history);

            smFgDocsToSave.add(smFgDoc);
            log.info("Queued piece: {} for placement into batch: {}", smFgId, batchId);
        }

        // 5. Bulk insert all pieces
        if (!smFgDocsToSave.isEmpty()) {
            mongoTemplate.insertAll(smFgDocsToSave);
            log.info("Successfully inserted {} SMFG pieces into batch {}", smFgDocsToSave.size(), batchId);
        }
    }

    //! ===> fetch the batch info...
    public GrowthBatchData getBatchInfoByBatchId(String batchId) {
        return growthBatchRepository.findByBatchId(batchId);
    }

    //! ===> fetch the batch id...
    public List<Map<String, Object>> getMouldsByBatchId(String batchId) {
        Query query = new Query(Criteria.where("smfgTransferHistory.batchId").is(batchId));
        List<SmFgData> rawMoulds = mongoTemplate.find(query, SmFgData.class);
        List<Map<String, Object>> result = new ArrayList<>();

        for (SmFgData doc : rawMoulds) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getId());
            map.put("smFgId", doc.getSmFgId());

            // Safely fetch typeOfMould from prevStationInfo and handle DBRef eagerly
            String typeOfMould = null;
            try {
                if (doc.getPrevStationInfo() != null) {
                    typeOfMould = doc.getPrevStationInfo().getTypeOfMould();
                }
            } catch (Exception e) {
                log.warn("Failed to eagerly resolve prevStationInfo for smFgId: {}", doc.getSmFgId(), e);
            }
            map.put("typeOfMould", typeOfMould);

            // Safely fetch and project history without DBRef serialization issues
            List<Map<String, Object>> historyList = new ArrayList<>();
            if (doc.getSmfgTransferHistory() != null) {
                for (SmfgTransferHistory record : doc.getSmfgTransferHistory()) {
                    Map<String, Object> recordMap = new HashMap<>();
                    recordMap.put("humidifierNo", record.getHumidifierNo());
                    recordMap.put("batchId", record.getBatchId());
                    recordMap.put("scanInTime", record.getScanInTime());
                    recordMap.put("outTime", record.getOutTime());
                    recordMap.put("transferBy", record.getTransferBy());
                    historyList.add(recordMap);
                }
            }
            map.put("smfgTransferHistory", historyList);

            result.add(map);
        }
        return result;
    }

    @Transactional
    public void markBatchFilled(String batchId, Double cycleTime) {
        log.info("Marking SMFG batch [{}] as filled and starting cycle 1 | cycleTime: {} hours", batchId, cycleTime);

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);
        if (batch == null) {
            log.warn("Cannot mark batch as filled — batch not found: [{}]", batchId);
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }

        batch.setMarkAsFilledTime(new Date());

        List<com.dharaksha.server.dto.batch.CycleEvent> cycleEvents = batch.getCycleEvents();
        if (cycleEvents == null) {
            cycleEvents = new ArrayList<>();
        }

        com.dharaksha.server.dto.batch.CycleEvent event = new com.dharaksha.server.dto.batch.CycleEvent();
        event.setOpeningTime(new Date());
        event.setCycleTime(cycleTime); // cycleTime is in hours
        event.setCycleNumber(1);

        String currentUser = securityUtil.getCurrentUser();
        event.setStartedBy(currentUser != null ? currentUser : "SYSTEM");
        log.info("Cycle 1 started for batch [{}] by user: {}", batchId, event.getStartedBy());

        cycleEvents.add(event);
        batch.setCycleEvents(cycleEvents);

        mongoTemplate.save(batch);
        log.info("Batch [{}] saved with markAsFilledTime and cycle 1 event.", batchId);

        if (batch.getHumidifierNo() != null) {
            Chamber chamber = chamberRepository.findBySerialNo(batch.getHumidifierNo());
            if (chamber != null) {
                chamber.setStatus("filledCompletely");
                mongoTemplate.save(chamber);
                log.info("Chamber [{}] status updated to 'filledCompletely' for batch [{}].", chamber.getSerialNo(), batchId);
            } else {
                log.warn("Chamber [{}] not found while marking batch [{}] as filled — chamber status not updated.",
                        batch.getHumidifierNo(), batchId);
            }
        }

        log.info("SMFG batch [{}] successfully marked as filled and cycle 1 initiated.", batchId);
    }

    // ! finish the batch and remove it from the chamber
    @Transactional
    public void finishBatch(String batchId, Integer growthType,
            List<org.springframework.web.multipart.MultipartFile> images) throws java.io.IOException {
        log.info("Starting finishBatch for SMFG batch [{}] | growthType: {} | images received: {}",
                batchId, growthType, images != null ? images.size() : 0);

        if (batchId == null || batchId.isBlank()) {
            throw new IllegalArgumentException("Batch ID is required");
        }
        if (growthType == null || growthType < 1 || growthType > 100) {
            throw new IllegalArgumentException("Growth type must be between 1 and 100");
        }
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required to finish the batch");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);
        if (batch == null) {
            log.warn("Batch not found in database: [{}]", batchId);
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }
        if (batch.getRemovedTime() != null) {
            log.warn("Attempt to finish already-removed SMFG batch [{}] — operation rejected.", batchId);
            throw new IllegalArgumentException("Batch has already been removed/finished");
        }

        // 1. Upload growth images to S3
        log.info("Uploading {} growth image(s) to S3 for SMFG batch [{}]...", images.size(), batchId);
        List<String> imageUrls = s3Service.uploadFiles(images);
        batch.setImages(imageUrls);
        log.info("Successfully uploaded {} image(s) for SMFG batch [{}].", imageUrls.size(), batchId);

        // 2. Record growth type, removal time, and removed-by user
        batch.setGrowthType(growthType);
        Date now = new Date();
        batch.setRemovedTime(now);
        String currentUser = securityUtil.getCurrentUser();
        batch.setRemovedBy(currentUser != null ? currentUser : "SYSTEM");
        log.info("SMFG batch [{}] marked as removed at {} by user: {}", batchId, now, batch.getRemovedBy());

        growthBatchRepository.save(batch);
        log.info("SMFG batch [{}] record updated and saved successfully.", batchId);

        // 3. Free up the chamber — set status to 'empty' and remove the batch reference
        Query query = new Query(Criteria.where("activeBatches.batchId").is(batchId));
        Chamber chamber = mongoTemplate.findOne(query, Chamber.class);
        if (chamber != null) {
            chamber.setStatus("empty");
            if (chamber.getActiveBatches() != null) {
                chamber.getActiveBatches().removeIf(ref -> batchId.equals(ref.getBatchId()));
            }
            mongoTemplate.save(chamber);
            log.info("Chamber [{}] freed — status set to 'empty' and batch [{}] reference removed.",
                    chamber.getSerialNo(), batchId);
        } else {
            log.warn("No chamber found with activeBatch reference for batch [{}] — skipping chamber cleanup.", batchId);
        }

        // 4. Stamp outTime on all SMFG mould records belonging to this batch
        Query mouldQuery = new Query(Criteria.where("smfgTransferHistory.batchId").is(batchId));
        List<SmFgData> moulds = mongoTemplate.find(mouldQuery, SmFgData.class);
        log.info("Found {} SMFG mould(s) to stamp outTime for batch [{}].", moulds.size(), batchId);

        int mouldUpdatedCount = 0;
        for (SmFgData mould : moulds) {
            List<com.dharaksha.server.dto.smfg.SmfgTransferHistory> history = mould.getSmfgTransferHistory();
            if (history == null || history.isEmpty()) {
                log.warn("SMFG mould [{}] has no transfer history — skipping outTime stamp.", mould.getSmFgId());
                continue;
            }
            boolean updated = false;
            for (com.dharaksha.server.dto.smfg.SmfgTransferHistory record : history) {
                if (batchId.equals(record.getBatchId()) && record.getOutTime() == null) {
                    record.setOutTime(now);
                    record.setTransferBy(currentUser != null ? currentUser : "SYSTEM");
                    updated = true;
                    break;
                }
            }
            if (updated) {
                mongoTemplate.save(mould);
                mouldUpdatedCount++;
            }
        }
        log.info("OutTime stamped for {}/{} SMFG mould(s) in batch [{}].", mouldUpdatedCount, moulds.size(), batchId);

        log.info("=== SMFG batch [{}] finish process completed successfully. GrowthType: {}, RemovedBy: {} ===",
                batchId, growthType, batch.getRemovedBy());
    }

    // ! ===> get all SMFG batches (for batch-data history page)
    public List<GrowthBatchData> getAllBatches() {
        log.info("Fetching all SMFG batch records from the database.");
        List<GrowthBatchData> batches = growthBatchRepository.findByDepartment("humidifer");
        log.info("Found {} SMFG batch record(s).", batches.size());
        return batches;
    }

    // ! ===> get batch details for batch-detail page (batchInfo + moulds + type counts + presigned images)
    public SmfgBatchDetailResponse getBatchDetails(String batchId) {
        log.info("Fetching SMFG batch details for batch: [{}]", batchId);

        GrowthBatchData batchInfo = growthBatchRepository.findByBatchId(batchId);

        // Generate presigned URLs for stored S3 image keys
        if (batchInfo != null && batchInfo.getImages() != null && !batchInfo.getImages().isEmpty()) {
            List<String> presignedImages = new ArrayList<>();
            for (String imgKey : batchInfo.getImages()) {
                presignedImages.add(s3Service.generatePresignedUrl(imgKey));
            }
            batchInfo.setImages(presignedImages);
            log.info("Generated {} presigned image URL(s) for SMFG batch [{}].", presignedImages.size(), batchId);
        }

        // Reuse existing projected mould list (already returns clean maps without DBRef issues)
        List<Map<String, Object>> mouldProjections = getMouldsByBatchId(batchId);
        log.info("Found {} SMFG mould(s) for batch [{}].", mouldProjections.size(), batchId);

        // Build mould type count breakdown from the projections
        Map<String, Long> mouldTypeCounts = mouldProjections.stream()
                .filter(m -> m.get("typeOfMould") != null && !m.get("typeOfMould").toString().isBlank())
                .collect(Collectors.groupingBy(
                        m -> m.get("typeOfMould").toString(),
                        Collectors.counting()
                ));

        log.info("SMFG batch [{}] detail response built — mouldTypes: {}", batchId, mouldTypeCounts);
        return new SmfgBatchDetailResponse(batchInfo, mouldProjections, mouldTypeCounts);
    }

}

