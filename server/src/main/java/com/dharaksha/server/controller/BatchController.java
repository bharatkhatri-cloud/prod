package com.dharaksha.server.controller;

import com.dharaksha.server.dto.batch.AddReadingRequest;
import com.dharaksha.server.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v2s/batch")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @PostMapping("/add-reading")
    public ResponseEntity<?> addReading(@RequestBody AddReadingRequest request) {
        try {
            batchService.addEnvironmentReading(request);
            return ResponseEntity.ok("Environment reading added successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/get-readings")
    public ResponseEntity<?> getReadings(@RequestParam String batchId) {
        try {
            return ResponseEntity.ok(batchService.getEnvironmentReadings(batchId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/remove-reading")
    public ResponseEntity<?> removeReading(@RequestParam String batchId, @RequestParam Long timestamp) {
        try {
            batchService.removeEnvironmentReading(batchId, timestamp);
            return ResponseEntity.ok("Environment reading removed successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/restart-cycle")
    public ResponseEntity<?> restartCycle(@RequestParam String batchId, @RequestParam(required = false) Double cycleTime) {
        try {
            batchService.restartCycle(batchId, cycleTime);
            return ResponseEntity.ok("Cycle ended and new cycle started successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/complete-cycle")
    public ResponseEntity<?> completeCycle(@RequestParam String batchId) {
        try {
            batchService.completeCycle(batchId);
            return ResponseEntity.ok("Cycle completed successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }



    @GetMapping("/all-batches")
    public ResponseEntity<?> getAllBatches() {
        try {
            return ResponseEntity.ok(batchService.getAllBatches());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }
}
