package com.dharaksha.server.repository;

import com.dharaksha.server.model.JamPreparation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JamPreparationRepository extends MongoRepository<JamPreparation, String> {
}
