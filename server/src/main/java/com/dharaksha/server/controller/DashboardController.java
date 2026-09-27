package com.dharaksha.server.controller;

import com.dharaksha.server.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v2s/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard-count")
    public ResponseEntity<?> getDashboardCounts(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> counts = dashboardService.getDashboardCounts(startDate, endDate);
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/lc-analytics")
    public ResponseEntity<?> getLcPreparationRejectionAnalytics(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        try {
            Map<String, Object> analytics = dashboardService.getLcPreparationRejectionAnalytics(fromDate, toDate);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/bag-analytics")
    public ResponseEntity<?> getBagInoculationIncubationAnalytics(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        try {
            Map<String, Object> analytics = dashboardService.getBagInoculationIncubationAnalytics(fromDate, toDate);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }
}
