package com.dharaksha.server.service;

import com.dharaksha.server.model.ValidationSetting;
import com.dharaksha.server.repository.ValidationSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ValidationSettingService {

    public static final String OVEN_IN_HUMIDIFIER_CHECK = "OVEN_IN_HUMIDIFIER_CHECK";
    public static final String MOULD_FILLING_BAG_CHECK = "MOULD_FILLING_BAG_CHECK";
    public static final String HUMIDIFIER_MOULD_FILLING_CHECK = "HUMIDIFIER_MOULD_FILLING_CHECK";

    private final ValidationSettingRepository repository;

    public boolean isEnabled(String settingKey, boolean defaultValue) {
        return repository.findBySettingKey(settingKey)
                .map(ValidationSetting::isEnabled)
                .orElse(defaultValue);
    }

    public List<ValidationSetting> getAllSettings() {
        ensureDefaults();
        List<ValidationSetting> settings = new ArrayList<>(repository.findAll());
        List<String> order = List.of(MOULD_FILLING_BAG_CHECK, HUMIDIFIER_MOULD_FILLING_CHECK, OVEN_IN_HUMIDIFIER_CHECK);
        settings.sort((a, b) -> {
            int idxA = order.indexOf(a.getSettingKey());
            int idxB = order.indexOf(b.getSettingKey());
            if (idxA == -1) idxA = 999;
            if (idxB == -1) idxB = 999;
            return Integer.compare(idxA, idxB);
        });
        return settings;
    }

    public ValidationSetting getSetting(String settingKey) {
        ensureDefaults();
        return repository.findBySettingKey(settingKey)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + settingKey));
    }

    public ValidationSetting updateSetting(String settingKey, boolean enabled) {
        ValidationSetting setting = repository.findBySettingKey(settingKey)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + settingKey));
        setting.setEnabled(enabled);
        return repository.save(setting);
    }

    private void ensureDefaults() {
        upsertDefault(
            MOULD_FILLING_BAG_CHECK,
            true,
            "Bag Check (Mould Filling)",
            "When enabled, the scanned Bag ID must exist in Bag Inoculation records before moulds can be filled. Turn OFF to allow filling moulds with any Bag ID."
        );
        upsertDefault(
            HUMIDIFIER_MOULD_FILLING_CHECK,
            true,
            "Mould Check (Humidifier)",
            "When enabled, scanned mould IDs must exist in Mould Filling records before they can be placed in the Humidifier. Turn OFF to allow placing any mould ID directly."
        );
        upsertDefault(
            OVEN_IN_HUMIDIFIER_CHECK,
            true,
            "Humidifier Check (Oven In)",
            "When enabled, pieces must exist in the Humidifier (SMFG records) before they can be placed in an oven."
        );
    }

    private void upsertDefault(String key, boolean defaultEnabled, String label, String description) {
        if (repository.findBySettingKey(key).isEmpty()) {
            ValidationSetting s = new ValidationSetting();
            s.setSettingKey(key);
            s.setEnabled(defaultEnabled);
            s.setLabel(label);
            s.setDescription(description);
            repository.save(s);
        }
    }
}
