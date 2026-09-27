package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "demouldingpieces")
public class DeMouldingPiece {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String mouldId;
    
    @Indexed(unique = true)
    private String smFgId;
    
    private Date deMouldingPieceTime;
    
    private String pieceDeMouldedBy;
    
    private String previousStatusTillMouldFilling;
}
