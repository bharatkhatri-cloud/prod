package com.dharaksha.server.repository.oven;

import com.dharaksha.server.model.oven.OvenInBatchData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OvenInBatchDataRepository extends MongoRepository<OvenInBatchData, String> {
    @Query("{'batchIdOfOvenIn': ?0}")
    Optional<OvenInBatchData> findByBatchIdOfOvenIn(String batchIdOfOvenIn);
}
