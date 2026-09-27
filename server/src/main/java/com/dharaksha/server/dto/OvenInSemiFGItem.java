package com.dharaksha.server.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.Date;

@Data
public class OvenInSemiFGItem {
    @Id
    private String id;
    private String smFgId;
    private String quality;
    private Date inTime;
    private Date outTime;
    private String inBy;
    private String outBy;
    private Object previous; // ObjectId or populated HumidifierData document
}
