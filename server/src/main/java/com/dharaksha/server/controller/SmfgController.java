package com.dharaksha.server.controller;

import com.dharaksha.server.dto.mouldFilling.MarkFilledRequest;
import com.dharaksha.server.dto.smfg.PlaceSmfgRequest;
import com.dharaksha.server.dto.smfg.SmfgBatchDetailResponse;
import com.dharaksha.server.model.GrowthBatchData;
import com.dharaksha.server.service.SmfgService;
import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v2s/smfg")
@RequiredArgsConstructor
@Slf4j
public class SmfgController {

    private final SmfgService smfgService;

    @PostMapping("/place")
    public ResponseEntity<String> placeSmfg(@RequestBody PlaceSmfgRequest request) {
        log.info("Received request to place SMFG pieces in batch: {}", request.getBatchId());
        try {
            smfgService.placeSmfg(request);
            return ResponseEntity.ok("SMFG pieces placed successfully");
        } catch (IllegalArgumentException e) {
            log.error("Client error placing SMFG pieces: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Server error placing SMFG pieces: ", e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/batch-info")
    public ResponseEntity<?> getBatchInfoByBatchId(@RequestParam String batchId) {
        log.info("Received request to fetch batch info for SMFG batch: {}", batchId);
        try {
            GrowthBatchData batchInfo = smfgService.getBatchInfoByBatchId(batchId);
            if (batchInfo == null) {
                return ResponseEntity.status(404).body("Batch not found");
            }
            return ResponseEntity.ok(batchInfo);
        } catch (Exception e) {
            log.error("Error fetching SMFG batch info: ", e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/id-by-batch")
    public ResponseEntity<?> getMouldsByBatchId(@RequestParam String batchId) {
        log.info("Received request to fetch moulds for SMFG batch: {}", batchId);
        try {
            List<?> moulds = smfgService.getMouldsByBatchId(batchId);
            return ResponseEntity.ok(moulds);
        } catch (Exception e) {
            log.error("Error fetching SMFG batch moulds: ", e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    //! mark filled and start the cycle...
    @PostMapping("/mark-filled")
    public ResponseEntity<?> markBatchFilled(@RequestBody MarkFilledRequest request) {
        log.info("Received request to mark SMFG batch as filled: {}", request.getBatchId());
        try {
            smfgService.markBatchFilled(request.getBatchId(), request.getCycleTime());
            return ResponseEntity.ok("Batch marked as filled and cycle started");
        } catch (IllegalArgumentException e) {
            log.error("Client error marking SMFG batch filled: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Server error marking SMFG batch filled: ", e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/finish-batch")
    public ResponseEntity<?> finishBatch(
            @RequestParam String batchId,
            @RequestParam Integer growthType,
            @RequestParam("images") org.springframework.web.multipart.MultipartFile[] images) {
        log.info("Received finish-batch request for SMFG batch: {} | growthType: {} | images: {}", batchId, growthType, images.length);
        try {
            smfgService.finishBatch(batchId, growthType, java.util.Arrays.asList(images));
            log.info("SMFG batch [{}] finished and removed from chamber successfully.", batchId);
            return ResponseEntity.ok("Batch finished and removed successfully.");
        } catch (IllegalArgumentException e) {
            log.warn("Client error finishing SMFG batch [{}]: {}", batchId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected server error while finishing SMFG batch [{}]: {}", batchId, e.getMessage(), e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/all-batches")
    public ResponseEntity<?> getAllBatches() {
        log.info("Received request to fetch all SMFG batches.");
        try {
            List<GrowthBatchData> batches = smfgService.getAllBatches();
            log.info("Returning {} SMFG batch record(s).", batches.size());
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            log.error("Unexpected error fetching all SMFG batches: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/batch-details")
    public ResponseEntity<?> getBatchDetails(@RequestParam String batchId) {
        log.info("Received request to fetch SMFG batch details for batch: [{}]", batchId);
        try {
            SmfgBatchDetailResponse response = smfgService.getBatchDetails(batchId);
            if (response.getBatchInfo() == null) {
                log.warn("SMFG batch not found: [{}]", batchId);
                return ResponseEntity.status(404).body("Batch not found");
            }
            log.info("Successfully fetched SMFG batch details for batch: [{}]", batchId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching SMFG batch details for batch [{}]: {}", batchId, e.getMessage(), e);
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

}
