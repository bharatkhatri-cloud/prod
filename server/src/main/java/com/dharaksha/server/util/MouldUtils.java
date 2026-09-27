package com.dharaksha.server.util;

import com.dharaksha.server.dto.mouldFilling.FilledNewMouldRequest;
import com.dharaksha.server.dto.mouldFilling.MouldTransferRecord;
import com.dharaksha.server.model.MouldFillingData;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class MouldUtils {

    
    public static Date getScanInTimeForBatch(MouldFillingData mould, String batchId) {
        if (mould != null && mould.getMouldTransferHistory() != null) {
            for (MouldTransferRecord record : mould.getMouldTransferHistory()) {
                if (batchId.equals(record.getBatchId())) {
                    return record.getScanInTime();
                }
            }
        }
        return null;
    }

    //? check mould duplication
    public static void checkDuplicateMoulds(List<FilledNewMouldRequest.MouldItem> mouldItems, MongoTemplate mongoTemplate) {
        List<String> mouldIds = new ArrayList<>();
        for (FilledNewMouldRequest.MouldItem item : mouldItems) {
            mouldIds.add(item.getMouldId());
        }

        Query query = new Query(Criteria.where("mouldId").in(mouldIds));

        List<MouldFillingData> existing = mongoTemplate.find(query, MouldFillingData.class);

        if (!existing.isEmpty()) {
            List<String> existingIds = new ArrayList<>();
            for (MouldFillingData doc : existing) {
                existingIds.add(doc.getMouldId());
            }
            throw new IllegalArgumentException("Mould IDs already scanned into another batch: " + existingIds);
        }
    }
}
