package com.dharaksha.server.controller;

import com.dharaksha.server.model.Notification;
import com.dharaksha.server.model.User;
import com.dharaksha.server.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// This controller creates the doors/endpoints for our frontend page to ask for notifications.
// It helps the webpage get, update, or delete notification sticky notes.
@Slf4j
@RestController
@RequestMapping("/api/v2s/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    // Get the list of notifications for the logged-in user.
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) String category) {
        try {
            // Find who is currently logged in.
            User loggedInUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = loggedInUser.getId();

            // Set up sorting so the newest notifications are shown first.
            Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

            List<Notification> list;
            // Filter by read/unread if requested.
            if (isRead != null) {
                list = notificationRepository.findByUserIdAndIsRead(userId, isRead, pageable);
            } 
            // Filter by category if requested.
            else if (category != null && !category.equalsIgnoreCase("all")) {
                list = notificationRepository.findByUserIdAndCategory(userId, category, pageable);
            } 
            // Otherwise, get all notifications for this user.
            else {
                list = notificationRepository.findByUserId(userId, pageable);
            }

            // Count the unread notifications and the total notifications.
            long unreadCount = notificationRepository.countByUserIdAndIsRead(userId, false);
            long totalCount = notificationRepository.countByUserId(userId);

            // Put all the results in a response map.
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("list", list);
            response.put("unreadCount", unreadCount);
            response.put("totalCount", totalCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get notifications", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Mark a single notification as read or unread.
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Boolean> body) {
        try {
            User loggedInUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Optional<Notification> notifOpt = notificationRepository.findById(id);
            if (notifOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Notification not found");
            }

            Notification notif = notifOpt.get();
            // Verify that this notification belongs to the logged-in user.
            if (!notif.getUserId().equals(loggedInUser.getId())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            // Read the request body to see if we should set read or unread. Default is read (true).
            boolean isRead = true;
            if (body != null && body.containsKey("isRead")) {
                isRead = body.get("isRead");
            }

            notif.setRead(isRead);
            Notification updated = notificationRepository.save(notif);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notification", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to update notification read status", e);
            return ResponseEntity.status(500).body("An error occurred");
        }
    }

    // Mark all notifications for the logged-in user as read.
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead() {
        try {
            User loggedInUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String userId = loggedInUser.getId();

            // Find all unread notifications for this user.
            List<Notification> unreadList = notificationRepository.findByUserIdAndIsRead(userId, false, Pageable.unpaged());
            for (Notification notif : unreadList) {
                notif.setRead(true);
            }
            notificationRepository.saveAll(unreadList);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to mark all notifications as read", e);
            return ResponseEntity.status(500).body("An error occurred");
        }
    }

    // Delete a single notification.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        try {
            User loggedInUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Optional<Notification> notifOpt = notificationRepository.findById(id);
            if (notifOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Notification not found");
            }

            Notification notif = notifOpt.get();
            // Verify that this notification belongs to the logged-in user.
            if (!notif.getUserId().equals(loggedInUser.getId())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            notificationRepository.deleteById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete notification", e);
            return ResponseEntity.status(500).body("An error occurred");
        }
    }
}
