package com.dharaksha.server.repository;

import com.dharaksha.server.model.SmFgData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SmFgDataRepository extends MongoRepository<SmFgData, String> {
    Optional<SmFgData> findBySmFgId(String smFgId);
    List<SmFgData> findBySmFgIdIn(List<String> smFgIds);
}
