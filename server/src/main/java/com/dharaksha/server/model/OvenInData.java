package com.dharaksha.server.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import com.dharaksha.server.dto.OvenInSemiFGItem;

@Data
@Document(collection = "ovendatas")
public class OvenInData {
//! this is old thing 
//! DELETE THIS 
    @Id
    private String id;
    private String batchIdOfOvenIn;
    private String ovenSerialNo;
    private String temp;
    private Date batchInTime;
    private Date batchOutTime;
    private List<OvenInSemiFGItem> ovenInSemiFGIds;

    @JsonProperty("__v")
    private int version;
}
