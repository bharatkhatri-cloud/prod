package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "lcrejections")
public class LcRejection {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String lcId;
    
    private String reasonOfRejection;
    
    private Date lcRejectionTime;
    
    private String lcRejectedBy;
    
    private String previousStatusTillLCPreparation;
}
