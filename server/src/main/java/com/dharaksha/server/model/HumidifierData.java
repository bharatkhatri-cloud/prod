package com.dharaksha.server.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "humidifierdatas")
public class HumidifierData {
    //!this is old thing
    @Id
    private String id;
    private String humidifierNo;
    private String batchId;
    private List<com.dharaksha.server.dto.HumidifierSmFgData> smFgData;
    private String placedBy;
    private List<Double> humidityReading;
    private List<Double> temperatureReading;
    private List<Date> readingTime;
    private List<String> images;
    private Date placingTime;
    private Date markAsFilledTime;
    private Date readingsFinishedTime;
    private Date removedTime;
    private String openedBy;
    private Integer growthType;
    @JsonProperty("__v")
    private int version;
}
