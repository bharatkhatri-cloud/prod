package com.dharaksha.server.controller;

import com.dharaksha.server.dto.MouldFillingResponse;
import com.dharaksha.server.service.MouldFillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.dharaksha.server.dto.mouldFilling.*;
import com.dharaksha.server.model.MouldFillingData;
import com.dharaksha.server.model.GrowthBatchData;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v2s/mould-filling/")
@RequiredArgsConstructor
@Slf4j
public class MouldFillingController {

    private final MouldFillingService mouldFillingService;

    
    @PostMapping("/filled-Mould-and-placed")
    public ResponseEntity<String> createFilledNewMould(@RequestBody FilledNewMouldRequest request) {
        try {
            mouldFillingService.createFilledNewMould(request);
            return ResponseEntity.ok("Moulds filled successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/batch-info")
    public ResponseEntity<?> getBatchInfoByBatchId(@RequestParam String batchId) {
        try {
            GrowthBatchData batchInfo = mouldFillingService.getBatchInfoByBatchId(batchId);
            if (batchInfo == null) {
                return ResponseEntity.status(404).body("Batch not found");
            }
            return ResponseEntity.ok(batchInfo);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/moulds-by-batch")
    public ResponseEntity<?> getMouldsByBatchId(@RequestParam String batchId) {
        try {
            List<MouldFillingData> moulds = mouldFillingService.getMouldsByBatchId(batchId);
            return ResponseEntity.ok(moulds);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }


    //! mark filled and start new cycle...
    @PostMapping("/mark-filled")
    public ResponseEntity<?> markBatchFilled(@RequestBody MarkFilledRequest request) {
        try {
            mouldFillingService.markBatchFilled(request.getBatchId(), request.getCycleTime());
            return ResponseEntity.ok("Batch marked as filled and cycle started");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }
    

    @GetMapping("/get-data")
    public ResponseEntity<MouldFillingResponse> getMouldData(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String typeOfMould,
            @RequestParam(required = false) String filledBy,
            @RequestParam(required = false) String bagId,
            @RequestParam(required = false) String mouldId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int resultPerPage) {

        MouldFillingResponse response = mouldFillingService.getMouldData(
                startDate, endDate, typeOfMould, filledBy, bagId, mouldId, page, resultPerPage);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/finish-batch")
    public ResponseEntity<?> finishBatch(
            @RequestParam String batchId,
            @RequestParam Integer growthType,
            @RequestParam("images") org.springframework.web.multipart.MultipartFile[] images) {
        log.info("Received finish-batch request for batchId: {} with {} images", batchId, images.length);
        try {
            mouldFillingService.finishBatch(batchId, growthType, java.util.Arrays.asList(images));
            log.info("Batch finished and removed successfully.");
            return ResponseEntity.ok("Batch finished and removed successfully.");
        } catch (IllegalArgumentException e) {
            log.error("Error finishing batch: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error finishing batch: ", e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }


    @GetMapping("/batch-details")
    public ResponseEntity<?> getBatchDetails(@RequestParam String batchId) {
        log.info("Fetching batch details for batchId: {}", batchId);
        try {
            BatchDetailResponse response = mouldFillingService.getBatchDetails(batchId);
            if (response.getBatchInfo() == null) {
                return ResponseEntity.status(404).body("Batch not found");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching batch details: ", e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    // This is the door/endpoint that the frontend webpage knocks on to tell the server:
    // "Hey, please reject this mould with ID X because of reason Y!"
    @PostMapping("/reject-mould")
    public ResponseEntity<?> rejectMould(@RequestBody java.util.Map<String, String> body) {
        try {
            String mouldId = body.get("mouldId");
            String reason = body.get("reason");
            if (mouldId == null || mouldId.isBlank()) {
                return ResponseEntity.badRequest().body("Mould ID is required");
            }
            // Delegate the rejection task to the mould filling service.
            mouldFillingService.rejectMould(mouldId, reason);
            return ResponseEntity.ok("Mould rejected successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }
}

