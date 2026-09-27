package com.dharaksha.server.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.Date;

@Data
public class MouldInfoItem {
    @Id
    private String id;
    private String humidifierNo;
    private String batchId;
    private Date   scanInTime;
    private Date   outTime;
    private Integer growthType;
    private String smFgId;
    private String mouldId;
    private String typeOfMould;
}
