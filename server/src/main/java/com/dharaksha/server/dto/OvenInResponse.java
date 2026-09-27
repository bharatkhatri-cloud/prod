package com.dharaksha.server.dto;

import com.dharaksha.server.model.OvenInData;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OvenInResponse {

    private String message;
    private int resultPerPage;
    private long totalCount;
    private long totalOvenInSemiFG;
    private List<OvenInData> ovenInData;
}
