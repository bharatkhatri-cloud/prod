package com.dharaksha.server.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class HumidifierSmFgData {
    @Id
    private String id;
    private String smFgId;
    private Object prevStationInfo; // ObjectId or populated MouldFilling document
}
