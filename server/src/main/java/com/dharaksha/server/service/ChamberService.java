package com.dharaksha.server.service;

import com.dharaksha.server.model.Chamber;
import com.dharaksha.server.repository.ChamberRepository;
import com.dharaksha.server.event.AlertEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChamberService {

    private final MongoTemplate mongoTemplate;
    private final ChamberRepository chamberRepository;
    private final ApplicationEventPublisher eventPublisher;

    public Chamber getChamberBySerialNo(String serialNo) {
        Query query = new Query(Criteria.where("serialNo").is(serialNo));
        return mongoTemplate.findOne(query, Chamber.class);
    }

    public Chamber addChamber(Chamber chamber) {
        if (chamberRepository.findBySerialNo(chamber.getSerialNo()) != null) {
            throw new IllegalArgumentException("Chamber with given Serial No.(" + chamber.getSerialNo() + ") already exists.");
        }
        if (chamber.getStatus() == null) {
            chamber.setStatus("empty");
        }
        if (chamber.getCycleCount() == null) {
            chamber.setCycleCount(0);
        }
        return chamberRepository.save(chamber);
    }

    public List<Chamber> getAllChambers() {
        return chamberRepository.findAll();
    }

    public Chamber deleteChamber(String id) {
        Optional<Chamber> chamberOpt = chamberRepository.findById(id);
        if (chamberOpt.isEmpty()) {
            throw new IllegalArgumentException("For Selected MongoDB Id No chambers found");
        }
        Chamber chamber = chamberOpt.get();
        if (!"empty".equals(chamber.getStatus())) {
            throw new IllegalArgumentException("Can't Remove!! Selected Chamber (\"" + chamber.getSerialNo() + "\") is currently '" + chamber.getStatus() + "', Chamber should be empty");
        }
        if (chamber.getActiveBatches() != null && !chamber.getActiveBatches().isEmpty()) {
            throw new IllegalArgumentException("Can't Remove!! Selected Chamber (\"" + chamber.getSerialNo() + "\") has active batches, Chamber should be empty");
        }
        chamberRepository.deleteById(id);
        return chamber;
    }

    // This method is called to update a chamber's status (like changing it to "maintenance").
    public Chamber updateChamberStatus(String id, String status) {
        if (status == null || !List.of("empty", "filledCompletely", "readingCollected", "clean", "maintenance").contains(status)) {
            throw new IllegalArgumentException("Invalid status value: " + status);
        }
        Optional<Chamber> chamberOpt = chamberRepository.findById(id);
        if (chamberOpt.isEmpty()) {
            throw new IllegalArgumentException("Chamber not found");
        }
        Chamber chamber = chamberOpt.get();
        String oldStatus = chamber.getStatus();
        chamber.setStatus(status);
        Chamber savedChamber = chamberRepository.save(chamber);

        // If the chamber was working fine, but now it enters "maintenance" mode:
        if ("maintenance".equalsIgnoreCase(status) && !"maintenance".equalsIgnoreCase(oldStatus)) {
            String subject = "Chamber Maintenance Warning - Serial No: " + chamber.getSerialNo();
            String message = String.format("Chamber '%s' has been put into MAINTENANCE state.", chamber.getSerialNo());
            // Shout out: "Attention! Chamber entered maintenance! Send warning email!"
            eventPublisher.publishEvent(new AlertEvent(this, "CHAMBER_MAINTENANCE", subject, message, "WARNING"));
        } 
        // If the chamber was in maintenance, but now it is fixed (exits maintenance):
        else if (!"maintenance".equalsIgnoreCase(status) && "maintenance".equalsIgnoreCase(oldStatus)) {
            String subject = "Chamber Maintenance Exited - Serial No: " + chamber.getSerialNo();
            String message = String.format("Chamber '%s' has been taken OUT of MAINTENANCE state. New status is '%s'.", 
                    chamber.getSerialNo(), status);
            // Shout out: "Chamber is fixed and back to normal! Send info email!"
            eventPublisher.publishEvent(new AlertEvent(this, "CHAMBER_MAINTENANCE", subject, message, "INFO"));
        }

        return savedChamber;
    }
}
