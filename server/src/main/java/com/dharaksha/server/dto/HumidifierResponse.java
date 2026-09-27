package com.dharaksha.server.dto;

import com.dharaksha.server.model.HumidifierData;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class HumidifierResponse {
    private boolean success;
    private String message;
    private long totalCount;
    private long totalFiltered;
    private int totalPages;
    private int resultPerPage;
    private List<HumidifierData> humidifiersData;
}
