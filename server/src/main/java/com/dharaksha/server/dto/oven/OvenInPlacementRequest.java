package com.dharaksha.server.dto.oven;

import lombok.Data;
import java.util.List;

@Data
public class OvenInPlacementRequest {
    private String ovenSerialNo;
    private String batchIdOfOvenIn;
    private String temp;
    private List<String> smFgIds;
}
