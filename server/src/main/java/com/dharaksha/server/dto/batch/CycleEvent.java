package com.dharaksha.server.dto.batch;

import lombok.Data;
import java.util.Date;

@Data
public class CycleEvent {
    //! first reading collect during the mark as filled time
    //! after continue to collect whenever the chamber is opened
    private Date openingTime; // openingTime == cycleStartedAt
    private Double cycleTime; // this is in hour
    private Integer cycleNumber;
    private String startedBy;
    
    //! during the start new cycle or ending the cycle 
    private String openedBy;
    private Date cycleEndedAt;
}