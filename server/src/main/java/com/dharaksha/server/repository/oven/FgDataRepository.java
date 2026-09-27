package com.dharaksha.server.repository.oven;

import com.dharaksha.server.model.oven.FgData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FgDataRepository extends MongoRepository<FgData, String> {
    Optional<FgData> findByFgId(String fgId);
    List<FgData> findByFgIdIn(List<String> fgIds);

    @Query("{'fgTransferHistory.batchIdOfOvenIn': ?0}")
    List<FgData> findByBatchId(String batchIdOfOvenIn);
}
