package com.dharaksha.server.repository;

import com.dharaksha.server.model.DeMouldingPiece;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeMouldingPieceRepository extends MongoRepository<DeMouldingPiece, String> {
}
