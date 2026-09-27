package com.dharaksha.server.model.oven;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.dharaksha.server.model.SmFgData;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "fgdatas")
public class FgData {

    @Id
    private String id;

    // renamed from smFgId — use transaction during data migration
    @Indexed(unique = true)
    private String fgId;



    //? ObjectId ref to 'smfgData' collection
    //? from the humidier 
    @DBRef
    private SmFgData previous;

    // this is from first ovenIn
    private Date inTime;

    // transfer history when fgData moves between ovens
    private List<FgTransferHistory> fgTransferHistory;
    
    // Enum: "T2", "TC", "T3", "N/D" — default: "N/D"
    private String quality;
    // scan in ovenOut / during quality qualification
    private Date outTime;
    private String outBy; //from ovenOut Login


    //todo: in the frontend/api return
    //total ovenInTime =  outTime - inTime  

    @JsonProperty("__v")
    private int version;
}
