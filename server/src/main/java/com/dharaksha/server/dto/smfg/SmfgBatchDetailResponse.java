package com.dharaksha.server.dto.smfg;

import com.dharaksha.server.model.GrowthBatchData;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmfgBatchDetailResponse {
    private GrowthBatchData batchInfo;
    private List<Map<String, Object>> moulds;
    private Map<String, Long> mouldTypeCounts;
}
