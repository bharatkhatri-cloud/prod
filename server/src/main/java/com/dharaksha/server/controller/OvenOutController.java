package com.dharaksha.server.controller;

import com.dharaksha.server.dto.oven.FgQualityDefinitionRequest;
import com.dharaksha.server.service.OvenOutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v2s/oven-out")
@RequiredArgsConstructor
@Slf4j
public class OvenOutController {

    private final OvenOutService ovenOutService;

    @GetMapping("/get-data")
    public ResponseEntity<?> getOvenOutDataList(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String smFgId,
            @RequestParam(required = false) String fgId,
            @RequestParam(required = false) String quality,
            @RequestParam(required = false) String outBy,
            @RequestParam(required = false) String typeOfMould,
            @RequestParam(required = false) String ovenSerialNo,
            @RequestParam(required = false) String batchIdOfOvenIn,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Received request to fetch oven-out data list: page={}, limit={}", page, limit);
        try {
            String effectiveFgId = (fgId != null && !fgId.isBlank()) ? fgId : smFgId;
            Map<String, Object> result = ovenOutService.getOvenOutDataList(
                    startDate, endDate, effectiveFgId, quality, outBy, typeOfMould, ovenSerialNo, batchIdOfOvenIn, page, limit);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching oven-out data list: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred while fetching oven-out data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @PutMapping("/defined-quality")
    public ResponseEntity<?> definedQualityOfFg(@RequestBody FgQualityDefinitionRequest request) {
        log.info("Received request to define quality for FG pieces: {}", request.getFgId());
        try {
            ovenOutService.definedQualityOfFg(request.getQuality(), request.getFgId());
            Map<String, String> success = new HashMap<>();
            success.put("message", "Submitted Successfully");
            return ResponseEntity.ok(success);
        } catch (IllegalArgumentException e) {
            log.error("Client error defining FG quality: {}", e.getMessage());
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            log.error("Server error defining FG quality: ", e);
            Map<String, String> err = new HashMap<>();
            err.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
