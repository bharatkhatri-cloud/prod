package com.dharaksha.server.repository;

import com.dharaksha.server.model.Chamber;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChamberRepository extends MongoRepository<Chamber, String> {
    Chamber findBySerialNo(String serialNo);
}
