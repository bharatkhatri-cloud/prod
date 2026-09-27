package com.dharaksha.server.model.oven;

import lombok.Data;

import java.util.Date;

@Data
public class OvenBatchInfo {

    private String batchId;

    //! add a cron job to auto-remove after 3/5 days
    //? ObjectId ref to 'ovenInBatches' collection
    private String dataId;

    private Date batchInTime;
}
