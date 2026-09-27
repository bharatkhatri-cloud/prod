package com.dharaksha.server.dto.oven;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OvensResponseDTO {
    private String id;
    private String serialNo;
    private String status;
    // private List<OvenBatchInfo> batchInfo;
    private int batchInfoCount;
}
