package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

import com.dharaksha.server.dto.smfg.SmfgTransferHistory;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Document(collection = "smfgdata")
public class SmFgData {
    
    @Id
    private String id;

    private String smFgId;

    // This is equivalent to Mongoose's { type: ObjectId, ref: 'mouldfilling' }
    // Spring Data MongoDB will automatically "populate" this field when queried!
    @DBRef
    private MouldFillingData prevStationInfo;

    // For the future if it transfers to other humidifiers
    private List<SmfgTransferHistory> smfgTransferHistory;

    @JsonProperty("__v")
    private int version;
}
