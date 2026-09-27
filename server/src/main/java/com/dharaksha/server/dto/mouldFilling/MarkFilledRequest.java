package com.dharaksha.server.dto.mouldFilling;

import lombok.Data;

@Data
public class MarkFilledRequest {
    private String batchId;
    private Double cycleTime;
}
