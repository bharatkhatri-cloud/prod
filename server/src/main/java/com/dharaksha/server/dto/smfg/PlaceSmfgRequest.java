package com.dharaksha.server.dto.smfg;

import lombok.Data;
import java.util.List;

@Data
public class PlaceSmfgRequest {
    
    private String growthChamberNo;
    private String batchId;
    private List<MouldItem> mould;

    //? helper...
    @Data
    public static class MouldItem {
        private String mouldId;
    }
}
