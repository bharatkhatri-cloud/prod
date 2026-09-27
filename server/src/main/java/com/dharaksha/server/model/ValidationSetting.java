package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "validation_settings")
public class ValidationSetting {

    @Id
    private String id;

    @Indexed(unique = true)
    private String settingKey;

    private boolean enabled;

    private String label;

    private String description;
}
