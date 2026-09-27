package com.dharaksha.server.dto.oven;

import lombok.Data;
import java.util.List;

@Data
public class FgQualityDefinitionRequest {
    private String quality;
    private List<String> fgId;
}
