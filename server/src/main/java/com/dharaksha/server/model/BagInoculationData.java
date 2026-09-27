package com.dharaksha.server.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "baginoculations")
public class BagInoculationData {

    @Id
    private String id;

    // unique bag identifier (e.g. SB0001)
    private String bagId;

    private Double bagQty;

    // ID of the JAM or LC that was used
    private String JamOrLcId;

    private Double JamOrLcQty;

    private Date inoculationTimeStamp;

    private String inoculatedBy;

    // Stores the ObjectId string of the previous step (Lcpreparation or Jampreparation).
    // Kept as a plain String because the target collection is determined at runtime
    // by previousStatusModel — a dynamic @DBRef is not supported by Spring Data MongoDB.
    // Resolve the actual document in the service layer using previousStatusModel as a discriminator.
    private String previousStatusTillJamOrLCPreparation;

    // Discriminator: which collection the above ID belongs to.
    // Values: "Lcpreparation" | "Jampreparation"  (matches Mongoose enum exactly)
    private String previousStatusModel;

    private String remark;

    @JsonProperty("__v")
    private int version;
}
