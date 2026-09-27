package com.dharaksha.server.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

import com.dharaksha.server.dto.mouldFilling.MouldTransferRecord;


@Data
@Document(collection = "mouldfillings")
public class MouldFillingData {

    @Id
    private String id;

    private String bagId;
    private String filledBy;
    private String mouldId;
    private String typeOfMould;
    private Date fillingDate;
    private String fillingId; //? this is logined userId
    
    //! link to bagData — lazy to avoid loading the full BagInoculation on every fetch
    @DBRef(lazy = true)
    private BagInoculationData previousStatusTillBagInoculation;

    //? if mould get rejected
    private boolean isMouldRejected;
    private String mouldRejectionReason;
    private Date mouldRejectionDate;
    private String mouldRejectedBy;
    
    // Added from new requirements:
    // array if transfer to another (e.g. H1, H2)
    //all these should be in the same order
    private List<MouldTransferRecord> mouldTransferHistory;

    @JsonProperty("__v")
    private int version;
}
