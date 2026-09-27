package com.dharaksha.server.dto;

import com.dharaksha.server.model.MouldFillingData;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MouldFillingResponse {

    private boolean success;
    private String message;
    private long totalDataOfMouldFilled;
    private long totalNoOfDataFiltered;
    private int totalDataShowedOnOnePage;
    private int resultPerPage;
    private int totalPages;
    private List<MouldFillingData> mouldFillingData;
}
