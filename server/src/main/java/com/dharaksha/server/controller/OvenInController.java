package com.dharaksha.server.controller;

import com.dharaksha.server.dto.oven.OvenInPlacementRequest;
import com.dharaksha.server.service.OvenInService;
import com.dharaksha.server.service.OvenPlacementService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2s/oven-in")
@RequiredArgsConstructor
@Slf4j
public class OvenInController {

    private final OvenInService ovenInService;
    private final OvenPlacementService ovenPlacementService;

    @GetMapping("/batches")
    public ResponseEntity<?> getOvenInBatches(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String ovenSerialNo,
            @RequestParam(required = false) String batchId,
            @RequestParam(required = false) String temp,
            @RequestParam(required = false) String batchInBy,
            @RequestParam(required = false) String batchOutBy,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Received request to fetch oven-in batches: page={}, limit={}", page, limit);
        try {
            Map<String, Object> result = ovenInService.getOvenInBatches(
                    startDate, endDate, ovenSerialNo, batchId, temp, batchInBy, batchOutBy, status, page, limit);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching oven-in batches: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred while fetching batches: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @PostMapping("/oven-in-new-pieces")
    public ResponseEntity<?> ovenInNewPieces(@RequestBody OvenInPlacementRequest request) {
        log.info("Received request to place FG pieces in Oven: {}, Batch: {}", request.getOvenSerialNo(), request.getBatchIdOfOvenIn());
        try {
            ovenPlacementService.placeFgInOven(request);
            Map<String, String> success = new HashMap<>();
            success.put("message", "Finished Goods pieces placed in oven successfully");
            return ResponseEntity.ok(success);
        } catch (IllegalArgumentException e) {
            log.error("Client error placing Finished Goods pieces in oven: {}", e.getMessage());
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            log.error("Server error placing Finished Goods pieces in oven: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/batch-wise-data")
    public ResponseEntity<?> getDataOfOvenBatchWise(
            @RequestParam String batchIdOfOvenIn,
            @RequestParam(required = false, defaultValue = "") String serialNo) {
        log.info("Received request to fetch batch-wise oven data for batch: {}, serialNo: {}", batchIdOfOvenIn, serialNo);
        try {
            Map<String, Object> data = ovenInService.getDataOfOvenBatchWise(batchIdOfOvenIn, serialNo);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Error fetching batch-wise oven data: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/fg-data")
    public ResponseEntity<?> getFgData(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String fgId,
            @RequestParam(required = false) String quality,
            @RequestParam(required = false) String outBy,
            @RequestParam(required = false) String typeOfMould,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Received request to fetch FG data: page={}, limit={}", page, limit);
        try {
            Map<String, Object> result = ovenInService.getFgDataList(
                    startDate, endDate, fgId, quality, outBy, typeOfMould, page, limit);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching FG data: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred while fetching FG data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @DeleteMapping("/batch-remove")
    public ResponseEntity<?> batchRemoveFromOven(
            @RequestParam String batchId,
            @RequestParam String serialNo) {
        log.info("Received request to remove batch: {} from oven: {}", batchId, serialNo);
        try {
            ovenInService.batchRemoveFromOven(serialNo, batchId);
            Map<String, String> success = new HashMap<>();
            success.put("message", "Batch removed from oven successfully");
            return ResponseEntity.ok(success);
        } catch (Exception e) {
            log.error("Error removing batch from oven: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
