package com.dharaksha.server.model.oven;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.Date;

@Data
public class FgTransferHistory {
    //! if in the future they want to transfer thing
    //! current do not tell them about this.....
    private String ovenSerialNo;
    private String batchIdOfOvenIn;
    @DBRef
    private OvenInBatchData ovenInBatchData;
    private Date transferedTime;
    private String transferedBy;    // from login
}
