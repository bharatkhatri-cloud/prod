package com.dharaksha.server.dto.batch;

import lombok.Data;

@Data
public class AddReadingRequest {
    private String batchId;
    private Double humidity;
    private Double temperature;
}
