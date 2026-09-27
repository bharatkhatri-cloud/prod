package com.dharaksha.server.repository;

import com.dharaksha.server.model.LcPreparation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LcPreparationRepository extends MongoRepository<LcPreparation, String> {
}
