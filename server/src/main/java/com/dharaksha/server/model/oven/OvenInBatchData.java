package com.dharaksha.server.model.oven;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "ovenInBatches")
public class OvenInBatchData {

    @Id
    private String id;

    @Indexed(unique = true)
    private String batchIdOfOvenIn;

    private String ovenSerialNo;

    private String temp;

    private Date batchInTime;

    private Date batchOutTime;

    private String batchInBy;

    //! in case of multi day cycle
    //! may be bot (from the cron job) or user mark the 
    private String batchOutBy;

    //todo: in the frontend/api return
    //total heatTrementDureation =  batchOutTime - batchInTime  

    @JsonProperty("__v")
    private int version;
}
