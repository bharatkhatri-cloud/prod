package com.dharaksha.server.service;

import com.dharaksha.server.dto.oven.OvensResponseDTO;
import com.dharaksha.server.model.oven.OvenBatchInfo;
import com.dharaksha.server.model.oven.Ovens;
import com.dharaksha.server.repository.oven.OvensRepository;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OvenOpsService {

    private final OvensRepository ovensRepository;

    public List<OvensResponseDTO> getAllOvens() {
        log.info("Fetching all ovens with status and total batchInfo count");
        List<Ovens> ovensList = ovensRepository.findAll();
        return ovensList.stream()
                .map(oven -> {
                    int batchCount = (oven.getBatchInfo() != null) ? oven.getBatchInfo().size() : 0;
                    return OvensResponseDTO.builder()
                            .id(oven.getId())
                            .serialNo(oven.getSerialNo())
                            .status(oven.getStatus())
                            // .batchInfo(oven.getBatchInfo())
                            .batchInfoCount(batchCount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<OvenBatchInfo> getBatchesByOvenSerialNo(String serialNo) {
        log.info("Fetching all batches for oven serial number: {}", serialNo);
        return ovensRepository.findBySerialNo(serialNo)
                .map(oven -> oven.getBatchInfo() != null ? oven.getBatchInfo() : new ArrayList<OvenBatchInfo>())
                .orElse(new ArrayList<>());
    }
}
