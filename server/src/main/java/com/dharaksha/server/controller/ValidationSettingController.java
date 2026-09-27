package com.dharaksha.server.controller;

import com.dharaksha.server.model.ValidationSetting;
import com.dharaksha.server.service.ValidationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2s/settings")
@RequiredArgsConstructor
public class ValidationSettingController {

    private final ValidationSettingService validationSettingService;

    @GetMapping
    public ResponseEntity<List<ValidationSetting>> getAllSettings() {
        return ResponseEntity.ok(validationSettingService.getAllSettings());
    }

    @GetMapping("/{settingKey}")
    public ResponseEntity<?> getSetting(@PathVariable String settingKey) {
        try {
            ValidationSetting setting = validationSettingService.getSetting(settingKey);
            return ResponseEntity.ok(setting);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{settingKey}")
    public ResponseEntity<?> updateSetting(
            @PathVariable String settingKey,
            @RequestBody Map<String, Boolean> body) {
        try {
            Boolean enabled = body.get("enabled");
            if (enabled == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing 'enabled' field in request body."));
            }
            ValidationSetting updated = validationSettingService.updateSetting(settingKey, enabled);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
