package com.dharaksha.server.repository;

import com.dharaksha.server.model.BagIncubation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BagIncubationRepository extends MongoRepository<BagIncubation, String> {
    Optional<BagIncubation> findByBagId(String bagId);
}
