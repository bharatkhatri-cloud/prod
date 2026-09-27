package com.dharaksha.server.service;

import com.dharaksha.server.model.oven.FgData;
import com.dharaksha.server.repository.oven.FgDataRepository;
import com.dharaksha.server.util.DateFilterUtil;
import com.dharaksha.server.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationOptions;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OvenOutService {

    private final FgDataRepository fgDataRepository;
    private final SecurityUtil securityUtil;
    private final MongoTemplate mongoTemplate;

    @Transactional
    public void definedQualityOfFg(String quality, List<String> fgIds) {
        log.info("Defining quality as {} for FG IDs: {}", quality, fgIds);

        if (fgIds == null || fgIds.isEmpty()) {
            throw new IllegalArgumentException("Scanned FG IDs list cannot be empty!");
        }

        // 1. Fetch matching FgData documents
        List<FgData> existingFgList = fgDataRepository.findByFgIdIn(fgIds);
        Map<String, FgData> fgMap = existingFgList.stream()
                .collect(Collectors.toMap(FgData::getFgId, f -> f));

        // 2. Check for missing IDs (that were never scanned in oven in)
        List<String> missingIds = new ArrayList<>();
        for (String id : fgIds) {
            if (!fgMap.containsKey(id)) {
                missingIds.add(id);
            }
        }
        if (!missingIds.isEmpty()) {
            throw new IllegalArgumentException("Can't submit!! The following IDs were not scanned during Oven In: "
                    + String.join(", ", missingIds));
        }

        // 3. Check for already defined/scanned quality (quality is not "N/D")
        List<String> alreadyScannedIds = new ArrayList<>();
        for (FgData fg : existingFgList) {
            if (fg.getQuality() != null && !fg.getQuality().equalsIgnoreCase("N/D")) {
                alreadyScannedIds.add(fg.getFgId());
            }
        }
        if (!alreadyScannedIds.isEmpty()) {
            throw new IllegalArgumentException("Can't submit!! The following IDs have already been scanned for Oven Out: "
                    + String.join(", ", alreadyScannedIds));
        }

        // 4. Perform updates
        String loggedInUser = securityUtil.getCurrentUser();
        if (loggedInUser == null) {
            loggedInUser = "SYSTEM";
        }

        Date now = new Date();
        for (FgData fg : existingFgList) {
            fg.setQuality(quality);
            fg.setOutTime(now);
            fg.setOutBy(loggedInUser);
        }

        fgDataRepository.saveAll(existingFgList);
    }

    public Map<String, Object> getOvenOutDataList(
            String startDate, String endDate,
            String fgId, String quality, String outBy,
            String typeOfMould, String ovenSerialNo, String batchIdOfOvenIn,
            int page, int limit) {

        log.info("Fetching Oven-Out FG data list. filters: startDate={}, endDate={}, fgId={}, quality={}, outBy={}, typeOfMould={}, ovenSerialNo={}, batchIdOfOvenIn={}, page={}, limit={}",
                startDate, endDate, fgId, quality, outBy, typeOfMould, ovenSerialNo, batchIdOfOvenIn, page, limit);

        // Lookup SmFgData via DBRef (previous.$id → smfgdata._id)
        LookupOperation lookupSmFg = LookupOperation.newLookup()
                .from("smfgdata")
                .localField("previous.$id")
                .foreignField("_id")
                .as("smFgInfo");

        // Lookup MouldFillingData via SmFgData's DBRef
        LookupOperation lookupMould = LookupOperation.newLookup()
                .from("mouldfillings")
                .localField("smFgInfo.prevStationInfo.$id")
                .foreignField("_id")
                .as("mouldInfo");

        // Build filter criteria
        List<Criteria> fgParts = new ArrayList<>();
        List<Criteria> lookupParts = new ArrayList<>();

        // Mandatory filter: outTime must exist (means quality is not N/D)
        fgParts.add(Criteria.where("outTime").exists(true).ne(null));
        fgParts.add(Criteria.where("quality").ne("N/D"));

        // Date filters on outTime
        if (DateFilterUtil.hasDateFilter(startDate, endDate)) {
            fgParts.add(DateFilterUtil.buildDateCriteria(startDate, endDate, "outTime"));
        }
        if (fgId != null && !fgId.isBlank()) {
            fgParts.add(Criteria.where("fgId").regex(fgId.trim(), "i"));
        }
        if (quality != null && !quality.isBlank()) {
            fgParts.add(Criteria.where("quality").regex(quality.trim(), "i"));
        }
        if (outBy != null && !outBy.isBlank()) {
            fgParts.add(Criteria.where("outBy").regex(outBy.trim(), "i"));
        }
        if (ovenSerialNo != null && !ovenSerialNo.isBlank()) {
            fgParts.add(Criteria.where("fgTransferHistory.ovenSerialNo").regex(ovenSerialNo.trim(), "i"));
        }
        if (batchIdOfOvenIn != null && !batchIdOfOvenIn.isBlank()) {
            fgParts.add(Criteria.where("fgTransferHistory.batchIdOfOvenIn").regex(batchIdOfOvenIn.trim(), "i"));
        }

        // Post-lookup filter
        if (typeOfMould != null && !typeOfMould.isBlank()) {
            lookupParts.add(Criteria.where("mouldInfo.typeOfMould").regex(typeOfMould.trim(), "i"));
        }

        // Shared pipeline stages: match FgData first -> lookup -> unwind -> match mouldInfo
        List<AggregationOperation> basePipeline = new ArrayList<>();
        if (!fgParts.isEmpty()) {
            basePipeline.add(Aggregation.match(new Criteria().andOperator(fgParts.toArray(new Criteria[0]))));
        }
        basePipeline.add(lookupSmFg);
        basePipeline.add(Aggregation.unwind("smFgInfo", true));
        basePipeline.add(lookupMould);
        basePipeline.add(Aggregation.unwind("mouldInfo", true));
        if (!lookupParts.isEmpty()) {
            basePipeline.add(Aggregation.match(new Criteria().andOperator(lookupParts.toArray(new Criteria[0]))));
        }

        AggregationOptions allowDiskUse = AggregationOptions.builder().allowDiskUse(true).build();

        // Count pipeline
        List<AggregationOperation> countPipeline = new ArrayList<>(basePipeline);
        countPipeline.add(Aggregation.count().as("total"));

        AggregationResults<Document> countResult = mongoTemplate.aggregate(
                Aggregation.newAggregation(countPipeline).withOptions(allowDiskUse), "fgdatas", Document.class);

        long totalCount = 0;
        if (!countResult.getMappedResults().isEmpty()) {
            Object raw = countResult.getMappedResults().get(0).get("total");
            if (raw instanceof Number) totalCount = ((Number) raw).longValue();
        }

        // Paginated Data pipeline
        List<AggregationOperation> dataPipeline = new ArrayList<>(basePipeline);
        dataPipeline.add(Aggregation.sort(Sort.by(Sort.Direction.DESC, "outTime")));
        dataPipeline.add(Aggregation.skip((long) (page - 1) * limit));
        dataPipeline.add(Aggregation.limit(limit));

        AggregationResults<Document> dataResult = mongoTemplate.aggregate(
                Aggregation.newAggregation(dataPipeline).withOptions(allowDiskUse), "fgdatas", Document.class);

        List<Map<String, Object>> fgDataList = dataResult.getMappedResults().stream()
                .map(this::mapFgDocument)
                .collect(Collectors.toList());

        // All Filtered Data pipeline (no skip & limit, sort in Java to avoid Mongo 32MB limit)
        List<AggregationOperation> allFilteredPipeline = new ArrayList<>(basePipeline);

        AggregationResults<Document> allFilteredResult = mongoTemplate.aggregate(
                Aggregation.newAggregation(allFilteredPipeline).withOptions(allowDiskUse), "fgdatas", Document.class);

        List<Map<String, Object>> allFilteredList = allFilteredResult.getMappedResults().stream()
                .map(this::mapFgDocument)
                .collect(Collectors.toList());

        // Sort in Java (descending outTime)
        allFilteredList.sort((a, b) -> {
            Date t1 = (Date) a.get("outTime");
            Date t2 = (Date) b.get("outTime");
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return t2.compareTo(t1);
        });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Oven-Out FG Data fetched successfully");
        response.put("ovenOutData", fgDataList);
        response.put("allFilteredData", allFilteredList);
        response.put("totalNoOfDataFiltered", totalCount);
        response.put("resultPerPage", limit);
        response.put("totalCount", totalCount);
        response.put("page", page);
        response.put("limit", limit);
        response.put("totalPages", (int) Math.ceil((double) totalCount / limit));
        return response;
    }

    private Map<String, Object> mapFgDocument(Document doc) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", doc.getObjectId("_id") != null ? doc.getObjectId("_id").toHexString() : null);
        item.put("fgId", doc.getString("fgId"));
        item.put("quality", doc.getString("quality"));
        item.put("inTime", doc.getDate("inTime"));
        item.put("outTime", doc.getDate("outTime"));
        item.put("outBy", doc.getString("outBy"));

        Document smFgInfo = doc.get("smFgInfo", Document.class);
        item.put("smFgId", smFgInfo != null ? smFgInfo.getString("smFgId") : doc.getString("fgId"));

        Document mouldInfo = doc.get("mouldInfo", Document.class);
        if (mouldInfo != null) {
            item.put("typeOfMould", mouldInfo.getString("typeOfMould"));
            item.put("mouldId", mouldInfo.getString("mouldId"));
            item.put("filledBy", mouldInfo.getString("filledBy"));
            item.put("fillingDate", mouldInfo.getDate("fillingDate"));
        } else {
            item.put("typeOfMould", null);
            item.put("mouldId", null);
            item.put("filledBy", null);
            item.put("fillingDate", null);
        }

        // Extract batch IDs and Oven Serial No from transfer history (latest is last element)
        List<Document> history = doc.getList("fgTransferHistory", Document.class);
        if (history != null && !history.isEmpty()) {
            Document latest = history.get(history.size() - 1);
            item.put("ovenSerialNo", latest.getString("ovenSerialNo"));
            item.put("batchIdOfOvenIn", latest.getString("batchIdOfOvenIn"));
        } else {
            item.put("ovenSerialNo", null);
            item.put("batchIdOfOvenIn", null);
        }

        return item;
    }
}
