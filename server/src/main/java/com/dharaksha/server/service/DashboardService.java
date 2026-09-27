package com.dharaksha.server.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final MongoTemplate mongoTemplate;

    private Date[] getDateRange(String startDate, String endDate) {
        boolean hasStart = startDate != null && !startDate.isBlank();
        boolean hasEnd   = endDate != null && !endDate.isBlank();

        LocalDate sDate;
        LocalDate eDate;

        if (hasStart && hasEnd) {
            sDate = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE);
            eDate = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE);
        } else if (hasStart) {
            sDate = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE);
            eDate = LocalDate.now();
        } else if (hasEnd) {
            sDate = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE);
            eDate = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE);
        } else {
            sDate = LocalDate.now();
            eDate = LocalDate.now();
        }

        Date start = Date.from(sDate.atStartOfDay(ZoneOffset.UTC).toInstant());
        Date end   = Date.from(eDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant());
        return new Date[] { start, end };
    }

    public Map<String, Object> getDashboardCounts(String startDate, String endDate) {
        Date[] dateRange = getDateRange(startDate, endDate);
        Date start = dateRange[0];
        Date end = dateRange[1];

        log.info("Calculating dashboard counts from {} to {}", start, end);

        // 1. Jam Preparation
        Query jamQuery = new Query(Criteria.where("jamPreparationTime").gte(start).lt(end));
        long totalCountDataOfPreparedJam = mongoTemplate.count(jamQuery, "jampreparations");

        // 2. LC Preparation
        Query lcPrepQuery = new Query(Criteria.where("lcPreparationTime").gte(start).lt(end));
        long totalCountDataOfPreparedLc = mongoTemplate.count(lcPrepQuery, "lcpreparations");

        // 3. LC Rejection
        Query lcRejectQuery = new Query(Criteria.where("lcRejectionTime").gte(start).lt(end));
        long totalCountDataOfRejectedLc = mongoTemplate.count(lcRejectQuery, "lcrejections");

        // 4. Bag Inoculation
        Query bagInocQuery = new Query(Criteria.where("inoculationTimeStamp").gte(start).lt(end));
        long totalCountDataOfBagInoculationData = mongoTemplate.count(bagInocQuery, "baginoculations");

        // 5. Bag Incubation (rejections)
        Query bagIncQuery = new Query(Criteria.where("bagRejectionTime").gte(start).lt(end));
        long totalCountDataOfRejectedBag = mongoTemplate.count(bagIncQuery, "bagincubations");

        // 6. Mould Batch (from growthbatches collection where department is mould-filling)
        Query mouldBatchQuery = new Query(Criteria.where("department").is("mould-filling")
                .and("placingTime").gte(start).lt(end));
        long mouldBatchCount = mongoTemplate.count(mouldBatchQuery, "growthbatches");

        // 7. Mould Filling
        Query mouldFillQuery = new Query(Criteria.where("fillingDate").gte(start).lt(end));
        long totalCountDataOfMouldFillingData = mongoTemplate.count(mouldFillQuery, "mouldfillings");

        // 8. Bags Used (unique bags scanned in mould filling)
        long bagScannedInMouldFillingCount = 0;
        try {
            Aggregation bagAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("fillingDate").gte(start).lt(end)),
                Aggregation.group("bagId"),
                Aggregation.count().as("count")
            );
            AggregationResults<Document> bagResults = mongoTemplate.aggregate(bagAgg, "mouldfillings", Document.class);
            Document mappedResult = bagResults.getUniqueMappedResult();
            if (mappedResult != null && mappedResult.containsKey("count")) {
                bagScannedInMouldFillingCount = ((Number) mappedResult.get("count")).longValue();
            }
        } catch (Exception e) {
            log.error("Error calculating unique bags used count", e);
        }

        // 9. Rejected Mould (from mouldfillings where isMouldRejected is true and rejection details exist)
        Query mouldRejectQuery = new Query(Criteria.where("isMouldRejected").is(true)
                .and("mouldRejectionReason").ne("").ne(null)
                .and("mouldRejectionDate").gte(start).lt(end)
                .and("mouldRejectedBy").ne("").ne(null));
        long mouldRejectionCount = mongoTemplate.count(mouldRejectQuery, "mouldfillings");

        // 10. De-Moulding Pieces
        Query deMouldQuery = new Query(Criteria.where("deMouldingPieceTime").gte(start).lt(end));
        long totalCountDataOfDeMouldedPiece = mongoTemplate.count(deMouldQuery, "demouldingpieces");

        // 11. Humidifier's Batch (from growthbatches where department is humidifier/humidifer)
        Query humidBatchQuery = new Query(Criteria.where("department").in("humidifier", "humidifer")
                .and("placingTime").gte(start).lt(end));
        long humidifierBatchCount = mongoTemplate.count(humidBatchQuery, "growthbatches");

        // 12. Pieces in Humidifier (unwind smfgTransferHistory and count matched entries)
        long humidifierCount = 0;
        try {
            Aggregation pieceAgg = Aggregation.newAggregation(
                Aggregation.unwind("smfgTransferHistory"),
                Aggregation.match(Criteria.where("smfgTransferHistory.scanInTime").gte(start).lt(end)),
                Aggregation.count().as("count")
            );
            AggregationResults<Document> pieceResults = mongoTemplate.aggregate(pieceAgg, "smfgdata", Document.class);
            Document mappedResult = pieceResults.getUniqueMappedResult();
            if (mappedResult != null && mappedResult.containsKey("count")) {
                humidifierCount = ((Number) mappedResult.get("count")).longValue();
            }
        } catch (Exception e) {
            log.error("Error calculating pieces in humidifier count", e);
        }

        // 13. Oven's Batch
        Query ovenBatchQuery = new Query(Criteria.where("batchInTime").gte(start).lt(end));
        long ovenInBatchCount = mongoTemplate.count(ovenBatchQuery, "ovenInBatches");

        // 14. Oven In Pieces
        Query ovenInQuery = new Query(Criteria.where("inTime").gte(start).lt(end));
        long ovenInCount = mongoTemplate.count(ovenInQuery, "fgdatas");

        // 15. Oven Out Pieces (having outTime within range)
        Query ovenOutQuery = new Query(Criteria.where("outTime").gte(start).lt(end));
        long ovenOutCount = mongoTemplate.count(ovenOutQuery, "fgdatas");

        Map<String, Object> allModuleData = new LinkedHashMap<>();
        allModuleData.put("totalCountDataOfPreparedJam", totalCountDataOfPreparedJam);
        allModuleData.put("totalCountDataOfPreparedLc", totalCountDataOfPreparedLc);
        allModuleData.put("totalCountDataOfRejectedLc", totalCountDataOfRejectedLc);
        allModuleData.put("totalCountDataOfBagInoculationData", totalCountDataOfBagInoculationData);
        allModuleData.put("totalCountDataOfRejectedBag", totalCountDataOfRejectedBag);
        allModuleData.put("mouldBatchCount", mouldBatchCount);
        allModuleData.put("totalCountDataOfMouldFillingData", totalCountDataOfMouldFillingData);
        allModuleData.put("bagScannedInMouldFillingCount", bagScannedInMouldFillingCount);
        allModuleData.put("mouldRejectionCount", mouldRejectionCount);
        allModuleData.put("totalCountDataOfDeMouldedPiece", totalCountDataOfDeMouldedPiece);
        allModuleData.put("humidifierBatchCount", humidifierBatchCount);
        allModuleData.put("humidifierCount", humidifierCount);
        allModuleData.put("ovenInBatchCount", ovenInBatchCount);
        allModuleData.put("ovenInCount", ovenInCount);
        allModuleData.put("ovenOutCount", ovenOutCount);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Data Of All Modules");
        response.put("allModuleData", allModuleData);

        return response;
    }

    public Map<String, Object> getLcPreparationRejectionAnalytics(String fromDate, String toDate) {
        Date[] dateRange = getDateRange(fromDate, toDate);
        Date start = dateRange[0];
        Date end = dateRange[1];

        log.info("Calculating LC Preparation & Rejection analytics from {} to {}", start, end);

        // 1. preparedForXtoYCount
        Query prepQuery = new Query(Criteria.where("lcPreparationTime").gte(start).lt(end));
        long preparedForXtoYCount = mongoTemplate.count(prepQuery, "lcpreparations");

        // 2. rejectedForPreparedInXtoYCount
        long rejectedForPreparedInXtoYCount = 0;
        try {
            Aggregation rejectedPreparedAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("lcPreparationTime").gte(start).lt(end)),
                Aggregation.lookup("lcrejections", "lcId", "lcId", "rejection"),
                Aggregation.match(Criteria.where("rejection.0").exists(true)),
                Aggregation.count().as("count")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(rejectedPreparedAgg, "lcpreparations", Document.class);
            Document mappedResult = results.getUniqueMappedResult();
            if (mappedResult != null && mappedResult.containsKey("count")) {
                rejectedForPreparedInXtoYCount = ((Number) mappedResult.get("count")).longValue();
            }
        } catch (Exception e) {
            log.error("Error calculating rejected LCs from those prepared in range", e);
        }

        // 3. acceptedForPreparedInXtoYCount
        long acceptedForPreparedInXtoYCount = preparedForXtoYCount - rejectedForPreparedInXtoYCount;

        //! 4. totalRejectionCountXtoY
        Query rejectQuery = new Query(Criteria.where("lcRejectionTime").gte(start).lt(end));
        long totalRejectionCountXtoY = mongoTemplate.count(rejectQuery, "lcrejections");

        // 5. rejectedForPreparedInXtoYReasonWise
        List<Document> rejectedForPreparedInXtoYReasonWise = new ArrayList<>();
        try {
            Aggregation reasonWisePreparedAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("lcPreparationTime").gte(start).lt(end)),
                Aggregation.lookup("lcrejections", "lcId", "lcId", "rejection"),
                Aggregation.unwind("rejection"),
                Aggregation.group("rejection.reasonOfRejection").count().as("count")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(reasonWisePreparedAgg, "lcpreparations", Document.class);
            for (Document doc : results.getMappedResults()) {
                Document item = new Document();
                item.put("reason", doc.get("_id"));
                item.put("count", doc.get("count"));
                rejectedForPreparedInXtoYReasonWise.add(item);
            }
        } catch (Exception e) {
            log.error("Error calculating reason-wise rejections for LCs prepared in range", e);
        }

        // 6. totalRejectionReasonWiseXtoY
        List<Document> totalRejectionReasonWiseXtoY = new ArrayList<>();
        try {
            Aggregation totalReasonWiseAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("lcRejectionTime").gte(start).lt(end)),
                Aggregation.group("reasonOfRejection").count().as("count")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(totalReasonWiseAgg, "lcrejections", Document.class);
            for (Document doc : results.getMappedResults()) {
                Document item = new Document();
                item.put("reason", doc.get("_id"));
                item.put("count", doc.get("count"));
                totalRejectionReasonWiseXtoY.add(item);
            }
        } catch (Exception e) {
            log.error("Error calculating total reason-wise rejections in range", e);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("preparedForXtoYCount", preparedForXtoYCount);
        response.put("rejectedForPreparedInXtoYCount", rejectedForPreparedInXtoYCount);
        response.put("acceptedForPreparedInXtoYCount", acceptedForPreparedInXtoYCount);
        response.put("totalRejectionCountXtoY", totalRejectionCountXtoY);
        response.put("rejectedForPreparedInXtoYReasonWise", rejectedForPreparedInXtoYReasonWise);
        response.put("totalRejectionReasonWiseXtoY", totalRejectionReasonWiseXtoY);

        return response;
    }

    public Map<String, Object> getBagInoculationIncubationAnalytics(String fromDate, String toDate) {
        Date[] dateRange = getDateRange(fromDate, toDate);
        Date start = dateRange[0];
        Date end = dateRange[1];

        log.info("Calculating Bag Inoculation & Incubation analytics from {} to {}", start, end);

        // 1. InoculatedForXtoYCount
        Query inocQuery = new Query(Criteria.where("inoculationTimeStamp").gte(start).lt(end));
        long InoculatedForXtoYCount = mongoTemplate.count(inocQuery, "baginoculations");

        // 2. rejectedForInoculatedInXtoYCount
        long rejectedForInoculatedInXtoYCount = 0;
        try {
            Aggregation rejectedInoculatedAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("inoculationTimeStamp").gte(start).lt(end)),
                Aggregation.lookup("bagincubations", "bagId", "bagId", "rejection"),
                Aggregation.match(Criteria.where("rejection.0").exists(true)),
                Aggregation.count().as("count")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(rejectedInoculatedAgg, "baginoculations", Document.class);
            Document mappedResult = results.getUniqueMappedResult();
            if (mappedResult != null && mappedResult.containsKey("count")) {
                rejectedForInoculatedInXtoYCount = ((Number) mappedResult.get("count")).longValue();
            }
        } catch (Exception e) {
            log.error("Error calculating rejected bags from those inoculated in range", e);
        }

        // 3. acceptedForInoculatedInXtoYCount
        long acceptedForInoculatedInXtoYCount = InoculatedForXtoYCount - rejectedForInoculatedInXtoYCount;

        // 4. totalRejectionCountXtoY
        Query rejectQuery = new Query(Criteria.where("bagRejectionTime").gte(start).lt(end));
        long totalRejectionCountXtoY = mongoTemplate.count(rejectQuery, "bagincubations");

        // 5. rejectedForInoculatedInXtoYReasonWise
        List<Document> rejectedForInoculatedInXtoYReasonWise = new ArrayList<>();
        try {
            Aggregation reasonWiseInoculatedAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("inoculationTimeStamp").gte(start).lt(end)),
                Aggregation.lookup("bagincubations", "bagId", "bagId", "rejection"),
                Aggregation.unwind("rejection"),
                Aggregation.group("rejection.reasonOfRejection").count().as("count")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(reasonWiseInoculatedAgg, "baginoculations", Document.class);
            for (Document doc : results.getMappedResults()) {
                Document item = new Document();
                item.put("reason", doc.get("_id"));
                item.put("count", doc.get("count"));
                rejectedForInoculatedInXtoYReasonWise.add(item);
            }
        } catch (Exception e) {
            log.error("Error calculating reason-wise rejections for bags inoculated in range", e);
        }

        // 6. totalRejectionReasonWiseXtoY
        List<Document> totalRejectionReasonWiseXtoY = new ArrayList<>();
        try {
            Aggregation totalReasonWiseAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("bagRejectionTime").gte(start).lt(end)),
                Aggregation.group("reasonOfRejection").count().as("count")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(totalReasonWiseAgg, "bagincubations", Document.class);
            for (Document doc : results.getMappedResults()) {
                Document item = new Document();
                item.put("reason", doc.get("_id"));
                item.put("count", doc.get("count"));
                totalRejectionReasonWiseXtoY.add(item);
            }
        } catch (Exception e) {
            log.error("Error calculating total reason-wise bag rejections in range", e);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("InoculatedForXtoYCount", InoculatedForXtoYCount);
        response.put("rejectedForInoculatedInXtoYCount", rejectedForInoculatedInXtoYCount);
        response.put("acceptedForInoculatedInXtoYCount", acceptedForInoculatedInXtoYCount);
        response.put("totalRejectionCountXtoY", totalRejectionCountXtoY);
        response.put("rejectedForInoculatedInXtoYReasonWise", rejectedForInoculatedInXtoYReasonWise);
        response.put("totalRejectionReasonWiseXtoY", totalRejectionReasonWiseXtoY);

        return response;
    }
}
