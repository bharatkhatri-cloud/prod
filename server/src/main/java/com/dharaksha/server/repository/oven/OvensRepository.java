package com.dharaksha.server.repository.oven;

import com.dharaksha.server.model.oven.Ovens;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OvensRepository extends MongoRepository<Ovens, String> {
    Optional<Ovens> findBySerialNo(String serialNo);
}
