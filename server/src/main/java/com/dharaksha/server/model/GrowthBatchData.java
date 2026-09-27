package com.dharaksha.server.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

import com.dharaksha.server.dto.batch.EnvironmentReading;
import com.dharaksha.server.dto.batch.CycleEvent;

@Data
@Document(collection = "growthbatches")
public class GrowthBatchData {
    @Id
    private String id;
    
    private String humidifierNo;
    
    private String batchId;
        
    // department: mould-filling or humidifer
    private String department;

    // for the first piece placed
    private Date placingTime;
    
    private String placedBy;

    private Date markAsFilledTime;

    //! first cycle will start when markAsFilledTime 
    private List<CycleEvent> cycleEvents;
    
    //! reading will take during the cycle
    private List<EnvironmentReading> environmentReadings;

    //!this is equal to cycleCompleted
    private Date readingsFinishedTime;

    private List<String> images;
    
    //this will required even though 
    //in this batch new mould come from the other batch
    //here we are storing the growth type for overall not for the particular mould
    private Integer growthType;
    
    private Date removedTime;

    private String removedBy; //? same as the logined user

    @JsonProperty("__v")
    private int version;
}
