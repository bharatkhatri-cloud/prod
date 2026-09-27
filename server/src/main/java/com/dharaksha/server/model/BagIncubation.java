package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "bagincubations")
public class BagIncubation {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String bagId;
    
    private String reasonOfRejection;
    
    private String bagRejectedBy;
    
    private Date bagRejectionTime;
    
    private String previousStatusTillBagInoculation;
}
