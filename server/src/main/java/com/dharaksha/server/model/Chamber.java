package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "humidifierschemas")
public class Chamber {

    @Id
    private String id;

    @Indexed(unique = true)
    private String serialNo;

    private String type;

    private String department;

    private Integer cycleCount = 0;

    private String status = "empty"; // 'empty','filledCompletely','readingCollected','clean','maintenance'

    @Data
    public static class BatchReference {
        private String batchId; // the batch's batchId
        private String id;     // the batch's document _id
    }

    private List<BatchReference> activeBatches;

}
