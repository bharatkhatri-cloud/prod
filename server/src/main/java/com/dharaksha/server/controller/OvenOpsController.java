package com.dharaksha.server.controller;

import com.dharaksha.server.dto.oven.OvensResponseDTO;
import com.dharaksha.server.model.oven.OvenBatchInfo;
import com.dharaksha.server.service.OvenOpsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2s/oven-ops")
@RequiredArgsConstructor
@Slf4j
public class OvenOpsController {

    private final OvenOpsService ovenOpsService;

    @GetMapping("/all-ovens")
    public ResponseEntity<?> getAllOvens() {
        log.info("Received request to fetch all ovens and their counts");
        try {
            List<OvensResponseDTO> ovens = ovenOpsService.getAllOvens();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Oven data");
            response.put("oven", ovens);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all ovens: ", e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/batches")
    public ResponseEntity<?> getBatchesByOvenSerialNo(@RequestParam String serialNo) {
        log.info("Received request to fetch all batches for oven serial number: {}", serialNo);
        try {
            List<OvenBatchInfo> batches = ovenOpsService.getBatchesByOvenSerialNo(serialNo);
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            log.error("Error fetching batches for oven: ", e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }
}
