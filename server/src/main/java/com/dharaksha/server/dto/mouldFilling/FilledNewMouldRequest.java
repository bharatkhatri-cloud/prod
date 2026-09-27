package com.dharaksha.server.dto.mouldFilling;

import lombok.Data;
import java.util.List;

@Data
public class FilledNewMouldRequest {
    private String bagId;
    private String filledBy;
    private String typeOfMould;
    private List<MouldItem> mould;
    private String growthChamberNo;
    private String batchId;

    @Data
    public static class MouldItem {
        private String mouldId;
    }
}
