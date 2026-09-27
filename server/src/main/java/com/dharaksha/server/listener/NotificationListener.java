package com.dharaksha.server.listener;

import com.dharaksha.server.event.AlertEvent;
import com.dharaksha.server.event.UserEvent;
import com.dharaksha.server.model.Notification;
import com.dharaksha.server.model.User;
import com.dharaksha.server.repository.NotificationRepository;
import com.dharaksha.server.repository.UserRepository;
import com.dharaksha.server.service.email.EmailTemplateService;
import com.dharaksha.server.service.email.NotificationService;
// We import Spring's messaging template to push alerts to specific users.
import org.springframework.messaging.simp.SimpMessagingTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

// This class is like a Mailroom Clerk who sits and listens for any notifications.
// When an event happens (like a user is created), the Clerk wakes up,
// formats the email letter, saves the notification sticky note to the database,
// and pushes it over WebSockets in real time.
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final EmailTemplateService emailTemplateService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    // We use the Messaging Template to handle our WebSocket routing.
    private final SimpMessagingTemplate messagingTemplate;

    // This gets a list of email addresses from our settings file.
    @Value("${notification.alert.recipients:}")
    private String alertRecipientsProp;

    // This method handles user-related emails and in-app notifications in the background.
    @Async
    @EventListener
    public void handleUserEvent(UserEvent event) {
        log.info("Received UserEvent: eventType={}, email={}", event.getEventType(), event.getRecipientEmail());
        try {
            // Find who should receive this notification.
            String recipientId = null;
            Optional<User> recipientOpt = userRepository.findByEmail(event.getRecipientEmail());
            if (recipientOpt.isPresent()) {
                recipientId = recipientOpt.get().getId();
            } else if (event.getUser() != null) {
                recipientId = event.getUser().getId();
            }

            // If it is a Welcome email:
            if ("WELCOME".equalsIgnoreCase(event.getEventType())) {
                // Set up the blanks for name, email, and role.
                Map<String, String> placeholders = new HashMap<>();
                placeholders.put("name", event.getUser().getName());
                placeholders.put("email", event.getUser().getEmail());
                placeholders.put("role", event.getUser().getRole());

                // Read user_welcome.html, fill in the blanks, and send email.
                String htmlContent = emailTemplateService.loadTemplate("user_welcome.html", placeholders);
                notificationService.sendHtmlEmail(
                        Collections.singletonList(event.getRecipientEmail()),
                        "Welcome to Dharaksha Ecosolutions",
                        htmlContent
                );

                // Save and push in-app notification.
                if (recipientId != null) {
                    Notification notif = new Notification();
                    notif.setUserId(recipientId);
                    notif.setTitle("Welcome to Dharaksha");
                    notif.setMessage("Hello " + event.getUser().getName() + ", your account has been successfully created.");
                    notif.setType("success");
                    notif.setCategory("User Management");

                    Notification saved = notificationRepository.save(notif);
                    // Push the notification over WebSocket to the private user queue.
                    messagingTemplate.convertAndSendToUser(recipientId, "/queue/notifications", saved);
                }
            } 
            // If it is a request for a temporary login link:
            else if ("ADMIN_ACCESS".equalsIgnoreCase(event.getEventType())) {
                // Set up blanks for the name and the login link.
                Map<String, String> placeholders = new HashMap<>();
                placeholders.put("userName", event.getUser().getName());
                placeholders.put("accessLink", event.getExtraData());

                // Read admin_link_access.html, fill in the blanks, and send email.
                String htmlContent = emailTemplateService.loadTemplate("admin_link_access.html", placeholders);
                notificationService.sendHtmlEmail(
                        Collections.singletonList(event.getRecipientEmail()),
                        event.getUser().getName() + " Account Information (Temporary Access)",
                        htmlContent
                );

                // Save and push in-app notification.
                if (recipientId != null) {
                    Notification notif = new Notification();
                    notif.setUserId(recipientId);
                    notif.setTitle("Account Information Access");
                    notif.setMessage("You can access the temporary account details for user " + event.getUser().getName() + ".");
                    notif.setType("info");
                    notif.setCategory("User Management");

                    Notification saved = notificationRepository.save(notif);
                    // Push the login notification over WebSocket to the private user queue.
                    messagingTemplate.convertAndSendToUser(recipientId, "/queue/notifications", saved);
                }
            } else {
                log.warn("Unknown user event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            log.error("Failed to process UserEvent", e);
        }
    }

    // This method handles system warnings and alerts (like a broken machine) in the background.
    @Async
    @EventListener
    public void handleAlertEvent(AlertEvent event) {
        log.info("Received AlertEvent: eventType={}, severity={}", event.getEventType(), event.getSeverity());
        try {
            //! Find out who needs to receive system alert emails. 
            //TODO: send the derapment so that find the recieption email from there
            List<String> recipients = getAlertRecipients();
            if (recipients.isEmpty()) {
                log.warn("No recipients resolved for AlertEvent: {}", event.getSubject());
                return;
            }

            // Decide which background color to use for the email header based on how bad the alert is.
            String severityClass = "info"; // default blue
            String type = "info";
            String sev = event.getSeverity() != null ? event.getSeverity().toLowerCase() : "info";
            if (sev.contains("critical") || sev.contains("error") || sev.contains("high")) {
                severityClass = "critical"; // red
                type = "error";
            } else if (sev.contains("warn")) {
                severityClass = "warning"; // orange
                type = "warning";
            }

            // We change the time format to show hours:minutes:seconds and then day-month-year.
            String formattedTimestamp = DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy")
                    .withZone(ZoneId.systemDefault())
                    .format(Instant.ofEpochMilli(event.getTimestamp()));

            // Put details into the alert placeholders.
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("severityClass", severityClass);
            placeholders.put("severity", event.getSeverity() != null ? event.getSeverity().toUpperCase() : "INFO");
            placeholders.put("eventType", event.getEventType());
            placeholders.put("alertMessage", event.getAlertMessage());
            placeholders.put("timestamp", formattedTimestamp);

            // Read system_alert.html, fill in details, and send the email.
            String htmlContent = emailTemplateService.loadTemplate("system_alert.html", placeholders);
            notificationService.sendHtmlEmail(recipients, event.getSubject(), htmlContent);

            // Determine category from event type.
            String category = "System";
            if ("MOULD_REJECTION".equalsIgnoreCase(event.getEventType())) {
                category = "Quality Control";
            } else if ("CHAMBER_MAINTENANCE".equalsIgnoreCase(event.getEventType())) {
                category = "Incubation";
            }

            // Save and push in-app notification to all resolved recipients.
            for (String email : recipients) {
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    String userId = userOpt.get().getId();
                    //! Notification model.. 
                    Notification notif = new Notification();
                    notif.setUserId(userId);
                    notif.setTitle(event.getSubject());
                    notif.setMessage(event.getAlertMessage());
                    notif.setType(type);
                    notif.setCategory(category);
                    //! Notification saved
                    Notification saved = notificationRepository.save(notif);
                    // Push the alert notification over WebSocket to the private user queue.
                    messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", saved);
                }
            }
        } catch (Exception e) {
            log.error("Failed to process AlertEvent", e);
        }
    }

    // Helper method to decide who gets the alerts.
    private List<String> getAlertRecipients() {
        List<String> recipients = new ArrayList<>();
        // Check if we listed recipient emails in our application.properties file.
        if (alertRecipientsProp != null && !alertRecipientsProp.trim().isEmpty()) {
            for (String email : alertRecipientsProp.split(",")) {
                String clean = email.trim();
                if (!clean.isEmpty()) {
                    recipients.add(clean);
                }
            }
        }
        // If the settings file is empty, find all users whose role is "Admin".
        if (recipients.isEmpty()) {
            List<User> admins = userRepository.findByRoleAndIsActive("Admin", true);
            for (User admin : admins) {
                if (admin.getEmail() != null && !admin.getEmail().trim().isEmpty()) {
                    recipients.add(admin.getEmail().trim());
                }
            }
        }
        return recipients;
    }
}
