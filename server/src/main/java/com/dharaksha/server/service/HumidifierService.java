package com.dharaksha.server.service;

import com.dharaksha.server.dto.HumidifierMouldInfoResponse;
import com.dharaksha.server.dto.HumidifierResponse;
import com.dharaksha.server.dto.MouldInfoItem;
import com.dharaksha.server.model.HumidifierData;
import com.dharaksha.server.util.DateFilterUtil;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HumidifierService {

    private final MongoTemplate mongoTemplate;

    public HumidifierResponse getHumidifierData(
            String startDate, String endDate,
            String humidifierNo, String batchId, String placedBy,
            String openedBy, Integer minGrowthType, Integer maxGrowthType,
            String removedStartDate, String removedEndDate,
            String markAsFilledStartDate, String markAsFilledEndDate,
            String readingsFinishedStartDate, String readingsFinishedEndDate,
            int page, int resultPerPage) {

        List<Criteria> criteriaList = new ArrayList<>();

        if (DateFilterUtil.hasDateFilter(startDate, endDate))
            criteriaList.add(DateFilterUtil.buildDateCriteria(startDate, endDate, "placingTime"));
        if (DateFilterUtil.hasDateFilter(removedStartDate, removedEndDate))
            criteriaList.add(DateFilterUtil.buildDateCriteria(removedStartDate, removedEndDate, "removedTime"));
        if (DateFilterUtil.hasDateFilter(markAsFilledStartDate, markAsFilledEndDate))
            criteriaList.add(DateFilterUtil.buildDateCriteria(markAsFilledStartDate, markAsFilledEndDate, "markAsFilledTime"));
        if (DateFilterUtil.hasDateFilter(readingsFinishedStartDate, readingsFinishedEndDate))
            criteriaList.add(DateFilterUtil.buildDateCriteria(readingsFinishedStartDate, readingsFinishedEndDate, "readingsFinishedTime"));
        if (humidifierNo != null && !humidifierNo.isBlank()) criteriaList.add(Criteria.where("humidifierNo").is(humidifierNo));
        if (batchId      != null && !batchId.isBlank())      criteriaList.add(Criteria.where("batchId").is(batchId));
        if (placedBy     != null && !placedBy.isBlank())     criteriaList.add(Criteria.where("placedBy").is(placedBy));
        if (openedBy     != null && !openedBy.isBlank())     criteriaList.add(Criteria.where("openedBy").is(openedBy));
        if (minGrowthType != null || maxGrowthType != null) {
            Criteria gc = Criteria.where("growthType");
            if (minGrowthType != null) gc = gc.gte(minGrowthType);
            if (maxGrowthType != null) gc = gc.lte(maxGrowthType);
            criteriaList.add(gc);
        }

        Criteria criteria = criteriaList.isEmpty()
                ? new Criteria()
                : new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));

        long totalCount    = mongoTemplate.count(new Query(), HumidifierData.class);
        long totalFiltered = mongoTemplate.count(new Query(criteria), HumidifierData.class);
        long skip          = (long) (page - 1) * resultPerPage;

        // After unwind+lookup+group, sort order is lost — re-sort by placingTime after group
        AggregationOperation groupStage = context -> new Document("$group", new Document()
                .append("_id",                    "$_id")
                .append("humidifierNo",           new Document("$first", "$humidifierNo"))
                .append("batchId",                new Document("$first", "$batchId"))
                .append("placedBy",               new Document("$first", "$placedBy"))
                .append("placingTime",            new Document("$first", "$placingTime"))
                .append("markAsFilledTime",       new Document("$first", "$markAsFilledTime"))
                .append("readingsFinishedTime",   new Document("$first", "$readingsFinishedTime"))
                .append("removedTime",            new Document("$first", "$removedTime"))
                .append("humidityReading",        new Document("$first", "$humidityReading"))
                .append("temperatureReading",     new Document("$first", "$temperatureReading"))
                .append("readingTime",            new Document("$first", "$readingTime"))
                .append("images",                 new Document("$first", "$images"))
                .append("openedBy",               new Document("$first", "$openedBy"))
                .append("growthType",             new Document("$first", "$growthType"))
                .append("__v",                    new Document("$first", "$__v"))
                .append("smFgData",               new Document("$push",  "$smFgData"))
        );

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "placingTime")),
                Aggregation.skip(skip),
                Aggregation.limit(resultPerPage),
                Aggregation.unwind("smFgData", true),
                Aggregation.lookup("mouldfillings", "smFgData.prevStationInfo", "_id", "smFgData.prevStationInfo"),
                Aggregation.unwind("$smFgData.prevStationInfo", true),
                groupStage,
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "placingTime"))
        );

        List<HumidifierData> data = mongoTemplate
                .aggregate(aggregation, "humidifierdatas", HumidifierData.class)
                .getMappedResults();

        int totalPages = (int) Math.ceil((double) totalFiltered / resultPerPage);

        return new HumidifierResponse(
                true,
                criteriaList.isEmpty() ? "Humidifier Data (recent " + resultPerPage + ")" : "Humidifier Data (filtered)",
                totalCount,
                totalFiltered,
                totalPages,
                resultPerPage,
                data
        );
    }

    public HumidifierMouldInfoResponse getMouldInfo(String startDate, String endDate,
                                                    Integer minGrowthType, Integer maxGrowthType,
                                                    String typeOfMould,
                                                    String removedStartDate, String removedEndDate,
                                                    int page, int resultPerPage) {

        List<Criteria> parentParts = new ArrayList<>();
        if (minGrowthType != null || maxGrowthType != null) {
            Criteria gc = Criteria.where("growthType");
            if (minGrowthType != null) gc = gc.gte(minGrowthType);
            if (maxGrowthType != null) gc = gc.lte(maxGrowthType);
            parentParts.add(gc);
        }
        Criteria parentCriteria = parentParts.isEmpty()
                ? new Criteria()
                : new Criteria().andOperator(parentParts.toArray(new Criteria[0]));

        List<Criteria> childParts = new ArrayList<>();
        if (DateFilterUtil.hasDateFilter(startDate, endDate))
            childParts.add(DateFilterUtil.buildDateCriteria(startDate, endDate, "smFgData.scanInTime"));
        if (DateFilterUtil.hasDateFilter(removedStartDate, removedEndDate))
            childParts.add(DateFilterUtil.buildDateCriteria(removedStartDate, removedEndDate, "smFgData.outTime"));
        if (typeOfMould != null && !typeOfMould.isBlank()) {
            childParts.add(Criteria.where("smFgData.prevStationInfo.typeOfMould").is(typeOfMould));
        }
        Criteria childCriteria = childParts.isEmpty()
                ? new Criteria()
                : new Criteria().andOperator(childParts.toArray(new Criteria[0]));

        long totalCount = mongoTemplate.count(new Query(), HumidifierData.class);
        long skip       = (long) (page - 1) * resultPerPage;

        // Base pipeline: expand every smFg row, join mould info, apply optional typeOfMould filter.
        // skip/limit come AFTER this so pagination is at the individual mould-row level.
        List<AggregationOperation> basePipeline = new ArrayList<>();
        basePipeline.add(Aggregation.match(parentCriteria));
        basePipeline.add(Aggregation.sort(Sort.by(Sort.Direction.DESC, "placingTime")));
        basePipeline.add(Aggregation.unwind("smFgData", true));
        basePipeline.add(Aggregation.lookup("mouldfillings", "smFgData.prevStationInfo", "_id", "smFgData.prevStationInfo"));
        basePipeline.add(Aggregation.unwind("$smFgData.prevStationInfo", true));
        if (!childParts.isEmpty()) {
            basePipeline.add(Aggregation.match(childCriteria));
        }

        // Count total mould rows (not documents) so pagination totals are accurate
        List<AggregationOperation> countPipeline = new ArrayList<>(basePipeline);
        countPipeline.add(context -> new Document("$count", "total"));
        AggregationResults<Document> countResult = mongoTemplate.aggregate(
                Aggregation.newAggregation(countPipeline), "humidifierdatas", Document.class);
        long totalFiltered = countResult.getMappedResults().isEmpty() ? 0L
                : ((Number) countResult.getMappedResults().get(0).get("total")).longValue();

        // Data pipeline: base + skip + limit + project
        AggregationOperation projectStage = context -> new Document("$project", new Document()
                .append("humidifierNo", 1)
                .append("batchId",      1)
                .append("scanInTime",   "$smFgData.scanInTime")
                .append("outTime",      "$smFgData.outTime")
                .append("growthType",   1)
                .append("smFgId",       "$smFgData.smFgId")
                .append("mouldId",      "$smFgData.prevStationInfo.mouldId")
                .append("typeOfMould",  "$smFgData.prevStationInfo.typeOfMould")
        );

        List<AggregationOperation> dataPipeline = new ArrayList<>(basePipeline);
        dataPipeline.add(Aggregation.skip(skip));
        dataPipeline.add(Aggregation.limit(resultPerPage));
        dataPipeline.add(projectStage);

        List<MouldInfoItem> items = mongoTemplate
                .aggregate(Aggregation.newAggregation(dataPipeline), "humidifierdatas", MouldInfoItem.class)
                .getMappedResults();

        int totalPages = totalFiltered == 0 ? 1 : (int) Math.ceil((double) totalFiltered / resultPerPage);

        boolean hasAnyFilter = !parentParts.isEmpty() || !childParts.isEmpty();
        return new HumidifierMouldInfoResponse(
                true,
                hasAnyFilter ? "Mould Info (filtered)" : "Mould Info (recent " + resultPerPage + ")",
                totalCount,
                totalFiltered,
                totalPages,
                resultPerPage,
                page,
                items.size(),
                items
        );
    }
}
