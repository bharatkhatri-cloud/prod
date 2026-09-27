package com.dharaksha.server.service;

import com.dharaksha.server.dto.batch.AddReadingRequest;
import com.dharaksha.server.dto.batch.EnvironmentReading;
import com.dharaksha.server.model.GrowthBatchData;
import com.dharaksha.server.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import com.dharaksha.server.repository.GrowthBatchRepository;
import org.springframework.stereotype.Service;

import com.dharaksha.server.dto.batch.CycleEvent;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import com.dharaksha.server.model.Chamber;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final SecurityUtil securityUtil;
    private final GrowthBatchRepository growthBatchRepository;
    private final MongoTemplate mongoTemplate;

    // ! add environment reading in a batch....
    public void addEnvironmentReading(AddReadingRequest request) {

        if (request.getBatchId() == null || request.getBatchId().isBlank()) {
            throw new IllegalArgumentException("Batch ID is required");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(request.getBatchId());

        if (batch == null) {
            throw new IllegalArgumentException("Batch not found: " + request.getBatchId());
        }

        if (request.getTemperature() == null || request.getTemperature() < 1 || request.getTemperature() > 100) {
            throw new IllegalArgumentException("Temperature must be between 1 and 100");
        }

        if (request.getHumidity() == null || request.getHumidity() < 1 || request.getHumidity() > 100) {
            throw new IllegalArgumentException("Humidity must be between 1 and 100");
        }

        EnvironmentReading reading = new EnvironmentReading();
        reading.setHumidity(request.getHumidity());
        reading.setTemperature(request.getTemperature());
        reading.setTime(new Date());

        String takenBy = securityUtil.getCurrentUser();
        reading.setTakenBy(takenBy != null ? takenBy : "SYSTEM");

        // Determine current cycle number
        int currentCycle = 0;
        if (batch.getCycleEvents() != null && !batch.getCycleEvents().isEmpty()) {
            // ? batch.getCycleEvents(): this is array of cycle events.
            currentCycle = batch.getCycleEvents().size();
        }
        reading.setDuringWhichCycle(currentCycle);

        if (batch.getEnvironmentReadings() == null) {
            batch.setEnvironmentReadings(new ArrayList<>());
        }

        batch.getEnvironmentReadings().add(reading);

        // TODO: 1st write.
        growthBatchRepository.save(batch);
    }

    // ! fetch environment readings for a batch
    public List<EnvironmentReading> getEnvironmentReadings(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            throw new IllegalArgumentException("Batch ID is required");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);

        if (batch == null) {
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }

        return batch.getEnvironmentReadings() != null ? batch.getEnvironmentReadings() : new ArrayList<>();
    }

    // ! remove environment reading in a batch
    public void removeEnvironmentReading(String batchId, Long timestamp) {
        if (batchId == null || batchId.isBlank()) {
            throw new IllegalArgumentException("Batch ID is required");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp is required to identify the reading");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);

        if (batch == null) {
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }

        if (batch.getEnvironmentReadings() != null) {
            boolean removed = batch.getEnvironmentReadings()
                    .removeIf(reading -> reading.getTime() != null && reading.getTime().getTime() == timestamp);

            if (removed) {
                growthBatchRepository.save(batch);
            } else {
                throw new IllegalArgumentException("Reading not found at the specified time");
            }
        }
    }

    // ! end current cycle and start a new one
    public void restartCycle(String batchId, Double manualCycleTime) {

        if (batchId == null || batchId.isBlank()) {
            throw new IllegalArgumentException("Batch ID is required");
        }

        if (manualCycleTime == null || manualCycleTime <= 0) {
            throw new IllegalArgumentException("Cycle time must be greater than 0");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);

        if (batch == null) {
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }

        // batch must already have at least one cycle
        if (batch.getCycleEvents() == null || batch.getCycleEvents().isEmpty()) {
            throw new IllegalArgumentException("No active cycle found for this batch");
        }

        Date now = new Date();

        List<CycleEvent> cycleEvents = batch.getCycleEvents();

        // 1. End current cycle
        CycleEvent lastCycle = cycleEvents.get(cycleEvents.size() - 1);

        // prevent ending already ended cycle
        if (lastCycle.getCycleEndedAt() != null) {
            throw new IllegalArgumentException("Current cycle is already ended");
        }

        lastCycle.setCycleEndedAt(now);
        

        // 2. Start new cycle
        CycleEvent newCycle = new CycleEvent();

        newCycle.setOpeningTime(now);
        newCycle.setCycleTime(manualCycleTime);
        newCycle.setCycleNumber(lastCycle.getCycleNumber() + 1);

        String currentUser = securityUtil.getCurrentUser();

        newCycle.setStartedBy(
                currentUser != null && !currentUser.isBlank()
                        ? currentUser
                        : "SYSTEM");

        // 3. Add new cycle
        cycleEvents.add(newCycle);

        //TODO: 1st write
        growthBatchRepository.save(batch);
    }

    // ! complete the cycle
    @Transactional
    public void completeCycle(String batchId) {
        if (batchId == null || batchId.isBlank()) {
            throw new IllegalArgumentException("Batch ID is required");
        }

        GrowthBatchData batch = growthBatchRepository.findByBatchId(batchId);
        if (batch == null) {
            throw new IllegalArgumentException("Batch not found: " + batchId);
        }

        if (batch.getReadingsFinishedTime() != null) {
            throw new IllegalArgumentException("Batch cycles have already been completed");
        }

        Date now = new Date();

        // End the current cycle if one is active
        if (batch.getCycleEvents() != null && !batch.getCycleEvents().isEmpty()) {
            List<CycleEvent> cycleEvents = batch.getCycleEvents();
            CycleEvent lastCycle = cycleEvents.get(cycleEvents.size() - 1);
            if (lastCycle.getCycleEndedAt() == null) {
                lastCycle.setCycleEndedAt(now);
            }
        }

        // Mark the entire batch cycle reading phase as finished
        batch.setReadingsFinishedTime(now);

        growthBatchRepository.save(batch);

        // Update Chamber status to readingCollected
        Query query = new Query(Criteria.where("activeBatches.batchId").is(batchId));
        Chamber chamber = mongoTemplate.findOne(query, Chamber.class);
        if (chamber != null) {
            chamber.setStatus("readingCollected");
            mongoTemplate.save(chamber);
        }
    }



    // ! fetch all batches
    public List<GrowthBatchData> getAllBatches() {
        return growthBatchRepository.findByDepartment("mould-filling");
    }
}
