package com.dharaksha.server.dto.smfg;

import lombok.Data;
import java.util.Date;

import org.springframework.data.mongodb.core.mapping.DBRef;

import com.dharaksha.server.model.GrowthBatchData;

@Data
public class SmfgTransferHistory {
    private String humidifierNo;
    private String batchId;
    @DBRef
    private GrowthBatchData batchInfo;
    private Date scanInTime;
    private Date outTime;
    private String transferBy;
}
