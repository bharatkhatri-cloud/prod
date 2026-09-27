package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "lcpreparations")
public class LcPreparation {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String lcId;
    
    private Double lcQty;
    
    private String scId;
    
    private Double scQty;
    
    private Date lcPreparationTime;
    
    private String lcPreparedBy;
}
