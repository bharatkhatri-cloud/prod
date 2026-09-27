package com.dharaksha.server.service;

import com.dharaksha.server.model.oven.FgData;
import com.dharaksha.server.model.oven.OvenInBatchData;
import com.dharaksha.server.model.oven.Ovens;
import com.dharaksha.server.repository.oven.FgDataRepository;
import com.dharaksha.server.repository.oven.OvenInBatchDataRepository;
import com.dharaksha.server.repository.oven.OvensRepository;
import com.dharaksha.server.util.DateFilterUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationOptions;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class OvenInService {
 
    private final MongoTemplate mongoTemplate;
    private final OvenInBatchDataRepository ovenInBatchDataRepository;
    private final FgDataRepository fgDataRepository;
    private final OvensRepository ovensRepository;

    public Map<String, Object> getOvenInBatches(
            String startDate, String endDate,
            String ovenSerialNo, String batchId,
            String temp, String batchInBy, String batchOutBy,
            String status, int page, int limit) {

        log.info("Fetching oven-in batches. filters: startDate={}, endDate={}, ovenSerialNo={}, batchId={}, temp={}, batchInBy={}, batchOutBy={}, status={}, page={}, limit={}",
                startDate, endDate, ovenSerialNo, batchId, temp, batchInBy, batchOutBy, status, page, limit);

        List<Criteria> parts = new ArrayList<>();

        if (DateFilterUtil.hasDateFilter(startDate, endDate)) {
            parts.add(DateFilterUtil.buildDateCriteria(startDate, endDate, "batchInTime"));
        }
        if (ovenSerialNo != null && !ovenSerialNo.isBlank()) {
            parts.add(Criteria.where("ovenSerialNo").regex(ovenSerialNo.trim(), "i"));
        }
        if (batchId != null && !batchId.isBlank()) {
            parts.add(Criteria.where("batchIdOfOvenIn").regex(batchId.trim(), "i"));
        }
        if (temp != null && !temp.isBlank()) {
            parts.add(Criteria.where("temp").regex(temp.trim(), "i"));
        }
        if (batchInBy != null && !batchInBy.isBlank()) {
            parts.add(Criteria.where("batchInBy").regex(batchInBy.trim(), "i"));
        }
        if (batchOutBy != null && !batchOutBy.isBlank()) {
            parts.add(Criteria.where("batchOutBy").regex(batchOutBy.trim(), "i"));
        }
        if (status != null && !status.isBlank()) {
            if ("active".equalsIgnoreCase(status)) {
                parts.add(Criteria.where("batchOutTime").isNull());
            } else if ("completed".equalsIgnoreCase(status)) {
                parts.add(Criteria.where("batchOutTime").ne(null));
            }
        }

        Criteria criteria = parts.isEmpty() ? new Criteria() : new Criteria().andOperator(parts.toArray(new Criteria[0]));

        long totalCount = mongoTemplate.count(new Query(criteria), OvenInBatchData.class);

        Query query = new Query(criteria)
                .with(Sort.by(Sort.Direction.DESC, "batchInTime"))
                .skip((long) (page - 1) * limit)
                .limit(limit);

        List<OvenInBatchData> batches = mongoTemplate.find(query, OvenInBatchData.class);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Oven-In Batches fetched successfully");
        response.put("batches", batches);
        response.put("totalCount", totalCount);
        response.put("page", page);
        response.put("limit", limit);
        response.put("totalPages", (int) Math.ceil((double) totalCount / limit));

        return response;
    }

    public Map<String, Object> getDataOfOvenBatchWise(String batchIdOfOvenIn, String serialNo) {
        // 1. Fetch the batch info
        Optional<OvenInBatchData> batchOpt = ovenInBatchDataRepository.findByBatchIdOfOvenIn(batchIdOfOvenIn);
        if (batchOpt.isEmpty()) {
            Map<String, Object> emptyRes = new HashMap<>();
            emptyRes.put("piecesData", Collections.emptyList());
            return emptyRes;
        }
        OvenInBatchData batchData = batchOpt.get();

        // 2. Fetch all FgData pieces inside this batch
        List<FgData> fgDataList = fgDataRepository.findByBatchId(batchIdOfOvenIn);

        // 3. Map to the list of pieces in the format expected by the frontend
        List<Map<String, Object>> ovenInSemiFGIds = new ArrayList<>();
        for (FgData fg : fgDataList) {
            Map<String, Object> item = new HashMap<>();
            item.put("smFgId", fg.getFgId());
            item.put("quality", fg.getQuality());
            item.put("inTime", fg.getInTime());
            item.put("inBy", batchData.getBatchInBy());
            item.put("outTime", fg.getOutTime());
            item.put("outBy", fg.getOutBy());

            // Safely fetch typeOfMould
            String type = "N/D";
            if (fg.getPrevious() != null && fg.getPrevious().getPrevStationInfo() != null) {
                type = fg.getPrevious().getPrevStationInfo().getTypeOfMould();
            }
            item.put("type", type);

            ovenInSemiFGIds.add(item);
        }

        // 4. Wrap it in piecesData list to match old API format
        Map<String, Object> piecesObj = new HashMap<>();
        piecesObj.put("ovenSerialNo", batchData.getOvenSerialNo());
        piecesObj.put("batchIdOfOvenIn", batchData.getBatchIdOfOvenIn());
        piecesObj.put("temp", batchData.getTemp());
        piecesObj.put("batchInTime", batchData.getBatchInTime());
        piecesObj.put("ovenInSemiFGIds", ovenInSemiFGIds);

        List<Map<String, Object>> piecesData = new ArrayList<>();
        piecesData.add(piecesObj);

        Map<String, Object> response = new HashMap<>();
        response.put("piecesData", piecesData);

        return response;
    }

    public Map<String, Object> getFgDataList(
            String startDate, String endDate,
            String fgId, String quality, String outBy,
            String typeOfMould,
            int page, int limit) {

        log.info("Fetching FG data list. filters: startDate={}, endDate={}, fgId={}, quality={}, outBy={}, typeOfMould={}, page={}, limit={}",
                startDate, endDate, fgId, quality, outBy, typeOfMould, page, limit);

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
        List<Criteria> parts = new ArrayList<>();
        if (DateFilterUtil.hasDateFilter(startDate, endDate)) {
            parts.add(DateFilterUtil.buildDateCriteria(startDate, endDate, "inTime"));
        }
        if (fgId != null && !fgId.isBlank()) {
            parts.add(Criteria.where("fgId").regex(fgId.trim(), "i"));
        }
        if (quality != null && !quality.isBlank()) {
            parts.add(Criteria.where("quality").regex(quality.trim(), "i"));
        }
        if (outBy != null && !outBy.isBlank()) {
            parts.add(Criteria.where("outBy").regex(outBy.trim(), "i"));
        }
        if (typeOfMould != null && !typeOfMould.isBlank()) {
            parts.add(Criteria.where("mouldInfo.typeOfMould").regex(typeOfMould.trim(), "i"));
        }

        // Shared pipeline stages: lookup + unwind + (optional) match
        List<AggregationOperation> basePipeline = new ArrayList<>();
        basePipeline.add(lookupSmFg);
        basePipeline.add(Aggregation.unwind("smFgInfo", true));
        basePipeline.add(lookupMould);
        basePipeline.add(Aggregation.unwind("mouldInfo", true));
        if (!parts.isEmpty()) {
            basePipeline.add(Aggregation.match(new Criteria().andOperator(parts.toArray(new Criteria[0]))));
        }

        // Count pipeline
        List<AggregationOperation> countPipeline = new ArrayList<>(basePipeline);
        countPipeline.add(Aggregation.count().as("total"));

        AggregationOptions allowDiskUse = AggregationOptions.builder().allowDiskUse(true).build();

        AggregationResults<Document> countResult = mongoTemplate.aggregate(
                Aggregation.newAggregation(countPipeline).withOptions(allowDiskUse), "fgdatas", Document.class);

        long totalCount = 0;
        if (!countResult.getMappedResults().isEmpty()) {
            Object raw = countResult.getMappedResults().get(0).get("total");
            if (raw instanceof Number) totalCount = ((Number) raw).longValue();
        }

        // Data pipeline
        List<AggregationOperation> dataPipeline = new ArrayList<>(basePipeline);
        dataPipeline.add(Aggregation.sort(Sort.by(Sort.Direction.DESC, "inTime")));
        dataPipeline.add(Aggregation.skip((long) (page - 1) * limit));
        dataPipeline.add(Aggregation.limit(limit));

        AggregationResults<Document> dataResult = mongoTemplate.aggregate(
                Aggregation.newAggregation(dataPipeline).withOptions(allowDiskUse), "fgdatas", Document.class);

        List<Map<String, Object>> fgDataList = dataResult.getMappedResults().stream()
                .map(this::mapFgDocument)
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "FG Data fetched successfully");
        response.put("fgDataList", fgDataList);
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
        item.put("smFgId", smFgInfo != null ? smFgInfo.getString("smFgId") : null);

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

        // Extract batch IDs from transfer history (latest is last element)
        List<Document> history = doc.getList("fgTransferHistory", Document.class);
        if (history != null && !history.isEmpty()) {
            item.put("batchId", history.get(history.size() - 1).getString("batchIdOfOvenIn"));
            List<String> allBatchIds = history.stream()
                    .map(h -> h.getString("batchIdOfOvenIn"))
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
            item.put("batchIds", allBatchIds);
        } else {
            item.put("batchId", null);
            item.put("batchIds", Collections.emptyList());
        }

        return item;
    }

    @Transactional
    public void batchRemoveFromOven(String serialNo, String batchId) {
        log.info("Removing batch: {} from oven: {}", batchId, serialNo);

        // 1. Update Ovens collection
        Optional<Ovens> ovenOpt = ovensRepository.findBySerialNo(serialNo);
        if (ovenOpt.isPresent()) {
            Ovens oven = ovenOpt.get();
            if (oven.getBatchInfo() != null) {
                oven.getBatchInfo().removeIf(info -> batchId.equalsIgnoreCase(info.getBatchId()));
                if (oven.getBatchInfo().isEmpty()) {
                    oven.setStatus("empty");
                }
            } else {
                oven.setStatus("empty");
            }
            ovensRepository.save(oven);
        }
    }
}
