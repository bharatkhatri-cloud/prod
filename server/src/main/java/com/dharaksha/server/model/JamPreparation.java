package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "jampreparations")
public class JamPreparation {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String jamId;
    
    private Double jamQty;
    
    private String lcId;
    
    private Double lcQty;
    
    private Date jamPreparationTime;
    
    private String jamPreparedBy;
}
