package com.dharaksha.server.controller;

import com.dharaksha.server.service.ChamberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dharaksha.server.model.Chamber;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2s/chamber")
@RequiredArgsConstructor
public class ChamberController {

    private final ChamberService chamberService;

    @GetMapping("/get-data")
    public ResponseEntity<?> getChamberBySerialNo(@RequestParam String serialNo) {
        try {
            Chamber chamber = chamberService.getChamberBySerialNo(serialNo);
            if (chamber != null) {
                return ResponseEntity.ok(chamber);
            } else {
                return ResponseEntity.status(404).body("Chamber not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/admin/addChamber")
    public ResponseEntity<?> addChamber(@RequestBody Chamber chamber) {
        try {
            Chamber createdChamber = chamberService.addChamber(chamber);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Chamber created successfully");
            response.put("createdChamber", createdChamber);
            return ResponseEntity.status(201).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(403).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllChambers() {
        try {
            List<Chamber> chambers = chamberService.getAllChambers();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Chambers data");
            response.put("chambers", chambers);
            return ResponseEntity.status(202).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/admin/deleteChamber/{id}")
    public ResponseEntity<?> deleteChamber(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Chamber ID is required");
            return ResponseEntity.status(400).body(response);
        }

        try {
            Chamber deletedChamber = chamberService.deleteChamber(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Chamber \"" + deletedChamber.getSerialNo() + "\" has been deleted successfully");
            response.put("deleteResponse", deletedChamber);
            return ResponseEntity.status(202).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            // Map the status code appropriately based on the error message
            int status = 403;
            if (e.getMessage().contains("found")) {
                status = 404; // Not Found
            } else if (e.getMessage().contains("required")) {
                status = 400; // Bad Request
            }
            return ResponseEntity.status(status).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Chamber updatedChamber = chamberService.updateChamberStatus(id, status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Chamber status updated to " + status + " successfully");
            response.put("chamber", updatedChamber);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(400).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
