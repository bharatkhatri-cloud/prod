package com.dharaksha.server.repository;

import com.dharaksha.server.model.MouldFillingData;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface MouldFillingRepository extends MongoRepository<MouldFillingData, String> {
    Optional<MouldFillingData> findByMouldId(String mouldId);
    List<MouldFillingData> findByMouldIdIn(List<String> mouldIds);
}
