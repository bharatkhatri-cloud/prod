package com.dharaksha.server.dto.batch;

import lombok.Data;
import java.util.Date;

@Data
public class EnvironmentReading {
    private Double humidity;
    private Double temperature;
    private Date time;
    private String takenBy;
    
    private Integer duringWhichCycle;
}