package com.dharaksha.server.dto.mouldFilling;

import com.dharaksha.server.model.GrowthBatchData;
import com.dharaksha.server.model.MouldFillingData;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchDetailResponse {
    private GrowthBatchData batchInfo;
    private List<MouldFillingData> moulds;
    private Map<String, Long> mouldTypeCounts;
}
