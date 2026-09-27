 package com.dharaksha.server.dto.mouldFilling;

import lombok.Data;


import java.util.Date;

import org.springframework.data.mongodb.core.mapping.DBRef;

import com.dharaksha.server.model.GrowthBatchData;

@Data
public class MouldTransferRecord {
    private String growthChamberNo; // e.g., H1, H2
    private String batchId;
   
    @DBRef(lazy = true)
    private GrowthBatchData batchInfo;
    private Date scanInTime;
    private Date outTime; //? when removing the batch, or transfer to other batch
    private String transferBy; //? same as the logined user
}