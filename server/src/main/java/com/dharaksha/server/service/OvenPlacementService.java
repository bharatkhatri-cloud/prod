package com.dharaksha.server.service;

import com.dharaksha.server.dto.oven.OvenInPlacementRequest;
import com.dharaksha.server.model.SmFgData;
import com.dharaksha.server.model.oven.FgData;
import com.dharaksha.server.model.oven.FgTransferHistory;
import com.dharaksha.server.model.oven.OvenBatchInfo;
import com.dharaksha.server.model.oven.OvenInBatchData;
import com.dharaksha.server.model.oven.Ovens;
import com.dharaksha.server.repository.SmFgDataRepository;
import com.dharaksha.server.repository.oven.FgDataRepository;
import com.dharaksha.server.repository.oven.OvenInBatchDataRepository;
import com.dharaksha.server.repository.oven.OvensRepository;
import com.dharaksha.server.util.SecurityUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OvenPlacementService {

    private final OvensRepository ovensRepository;
    private final OvenInBatchDataRepository ovenInBatchDataRepository;
    private final FgDataRepository fgDataRepository;
    private final SmFgDataRepository smFgDataRepository;
    private final SecurityUtil securityUtil;
    private final ValidationSettingService validationSettingService;

    @Transactional
    public void placeFgInOven(OvenInPlacementRequest request) {
        String ovenSerialNo = request.getOvenSerialNo();
        String batchIdOfOvenIn = request.getBatchIdOfOvenIn();
        List<String> smFgIds = request.getSmFgIds();

        String loggedInUser = securityUtil.getCurrentUser();
        if (loggedInUser == null) {
            loggedInUser = "SYSTEM";
        }

        log.info("Finished Goods placement request for Oven: {}, Batch: {}, Pieces count: {}, Scanned by: {}",
                ovenSerialNo, batchIdOfOvenIn, smFgIds != null ? smFgIds.size() : 0, loggedInUser);

        // 1. Basic validation
        if (smFgIds == null || smFgIds.isEmpty()) {
            throw new IllegalArgumentException("Please input at least one Mould/Piece ID.");
        }

        if (ovenSerialNo == null || ovenSerialNo.isBlank()) {
            throw new IllegalArgumentException("Oven Serial Number is required.");
        }

        if (batchIdOfOvenIn == null || batchIdOfOvenIn.isBlank()) {
            throw new IllegalArgumentException("Batch ID is required.");
        }

        // 2. Validate that the Oven exists in database
        Ovens oven = ovensRepository.findBySerialNo(ovenSerialNo)
                .orElseThrow(() -> new IllegalArgumentException("Oven \"" + ovenSerialNo + "\" is not found in the database."));

        // 3. Validate that scanned pieces are NOT already in the oven/fgdatas collection
        List<FgData> alreadyInOven = fgDataRepository.findByFgIdIn(smFgIds);
        if (!alreadyInOven.isEmpty()) {
            List<String> duplicateIds = alreadyInOven.stream()
                    .map(FgData::getFgId)
                    .collect(Collectors.toList());
            throw new IllegalArgumentException("Can't add!! The following Finished Goods IDs are already in an oven: "
                    + String.join(", ", duplicateIds));
        }

        // 4. Optionally validate that moulds exist in the humidifier (SmFgData collection)
        List<SmFgData> existingSmFg = smFgDataRepository.findBySmFgIdIn(smFgIds);
        Map<String, SmFgData> smFgMap = existingSmFg.stream()
                .collect(Collectors.toMap(SmFgData::getSmFgId, s -> s));

        boolean humidifierCheckEnabled = validationSettingService.isEnabled(
                ValidationSettingService.OVEN_IN_HUMIDIFIER_CHECK, true);

        if (humidifierCheckEnabled) {
            List<String> missingSmFgIds = new ArrayList<>();
            for (String id : smFgIds) {
                if (!smFgMap.containsKey(id)) {
                    missingSmFgIds.add(id);
                }
            }
            if (!missingSmFgIds.isEmpty()) {
                throw new IllegalArgumentException("Can't add!! The following IDs are not found in the Humidifier (SMFG records): "
                        + String.join(", ", missingSmFgIds));
            }
        } else {
            log.info("Humidifier check is DISABLED by admin settings. Skipping SMFG validation.");
        }

        // 5. Look up existing OvenInBatchData
        Optional<OvenInBatchData> existingBatchOpt = ovenInBatchDataRepository.findByBatchIdOfOvenIn(batchIdOfOvenIn);
        OvenInBatchData batchData;

        if (existingBatchOpt.isEmpty()) {
            // New Batch creation!
            String temp = request.getTemp();
            if (temp == null || temp.isBlank()) {
                throw new IllegalArgumentException("Please enter the temperature of the batch.");
            }

            log.info("Batch {} not found. Creating new Oven In Batch.", batchIdOfOvenIn);
            batchData = new OvenInBatchData();
            batchData.setBatchIdOfOvenIn(batchIdOfOvenIn);
            batchData.setOvenSerialNo(ovenSerialNo);
            batchData.setTemp(temp);
            batchData.setBatchInTime(new Date());
            batchData.setBatchInBy(loggedInUser);

            //TODO: 1st write creating batch
            batchData = ovenInBatchDataRepository.save(batchData);

            // Link the active batch into Ovens collection
            OvenBatchInfo batchInfoEntry = new OvenBatchInfo();
            batchInfoEntry.setBatchId(batchIdOfOvenIn);
            batchInfoEntry.setDataId(batchData.getId());
            batchInfoEntry.setBatchInTime(batchData.getBatchInTime());

            if (oven.getBatchInfo() == null) {
                oven.setBatchInfo(new ArrayList<>());
            }
            oven.getBatchInfo().add(batchInfoEntry);
            oven.setStatus("filled");
            //TODO : 2nd write for status and batch adding....
            ovensRepository.save(oven);

        } else {
            // Adding to existing batch!
            batchData = existingBatchOpt.get();
            log.info("Batch {} already exists. Appending pieces to it.", batchIdOfOvenIn);

            // Double check that the existing batch belongs to this oven
            if (!batchData.getOvenSerialNo().equalsIgnoreCase(ovenSerialNo)) {
                throw new IllegalArgumentException("Batch ID \"" + batchIdOfOvenIn + "\" is registered with Oven \""
                        + batchData.getOvenSerialNo() + "\", but request was made for Oven \"" + ovenSerialNo + "\".");
            }

            oven.setStatus("filled");
            //TODO :  2nd write for status...
            ovensRepository.save(oven);
        }

        // 6. Create FgData documents for all scanned pieces
        List<FgData> fgDataListToSave = new ArrayList<>();
        for (String id : smFgIds) {
            SmFgData prevSmFg = smFgMap.get(id); // may be null when humidifier check is disabled

            FgData fgData = new FgData();
            fgData.setFgId(id);
            fgData.setPrevious(prevSmFg);
            fgData.setInTime(new Date());
            fgData.setQuality("N/D");

            FgTransferHistory transferHistory = new FgTransferHistory();
            transferHistory.setOvenSerialNo(ovenSerialNo);
            transferHistory.setBatchIdOfOvenIn(batchIdOfOvenIn);
            transferHistory.setOvenInBatchData(batchData);
            transferHistory.setTransferedTime(fgData.getInTime());
            transferHistory.setTransferedBy(loggedInUser);

            List<FgTransferHistory> historyList = new ArrayList<>();
            historyList.add(transferHistory);
            fgData.setFgTransferHistory(historyList);

            fgDataListToSave.add(fgData);
        }

        //TODO: 3rd write for the fgdata saving
        fgDataRepository.saveAll(fgDataListToSave);
        log.info("Successfully placed {} pieces inside Oven: {}, Batch: {}", smFgIds.size(), ovenSerialNo, batchIdOfOvenIn);
    }
}
