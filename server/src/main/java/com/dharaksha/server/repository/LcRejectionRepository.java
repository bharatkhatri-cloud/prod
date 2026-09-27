package com.dharaksha.server.repository;

import com.dharaksha.server.model.LcRejection;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LcRejectionRepository extends MongoRepository<LcRejection, String> {
}
