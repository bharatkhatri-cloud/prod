package com.dharaksha.server.model.oven;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;


import java.util.List;

@Data
@Document(collection = "ovens")
public class Ovens {

    @Id
    private String id;

    @Indexed(unique = true)
    private String serialNo;

    // Enum: "empty", "filled" — default: "empty"
    private String status = "empty";

    //! cron job: auto-remove entries after 3/5 days
    private List<OvenBatchInfo> batchInfo;

    @JsonProperty("__v")
    private int version;
}
