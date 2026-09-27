package com.dharaksha.server.repository;

import com.dharaksha.server.model.GrowthBatchData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrowthBatchRepository extends MongoRepository<GrowthBatchData, String> {
    GrowthBatchData findByBatchId(String batchId);
    java.util.List<GrowthBatchData> findByDepartment(String department);
}
