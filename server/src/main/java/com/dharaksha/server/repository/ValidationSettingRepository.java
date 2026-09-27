package com.dharaksha.server.repository;

import com.dharaksha.server.model.ValidationSetting;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ValidationSettingRepository extends MongoRepository<ValidationSetting, String> {
    Optional<ValidationSetting> findBySettingKey(String settingKey);
}
