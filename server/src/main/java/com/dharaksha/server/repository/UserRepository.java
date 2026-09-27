package com.dharaksha.server.repository;

import com.dharaksha.server.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByIsActive(boolean isActive, Pageable pageable);
    long countByIsActive(boolean isActive);
    List<User> findByRoleAndIsActive(String role, Boolean isActive);
}
