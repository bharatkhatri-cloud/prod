package com.dharaksha.server.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

// This model represents a single notification saved in our database.
// Think of it like a sticky note that we save for a user, containing an alert message.
@Data
@Document(collection = "notifications")
public class Notification {

    // This is the special, unique ID number for this sticky note.
    @Id
    private String id;

    // This is the ID of the user who should receive this notification.
    private String userId;

    // This is the title of the alert, like "Oven Humidity Warning".
    private String title;

    // This is the detailed message of the alert, like "Chamber 3 is at 50% humidity".
    private String message;

    // This is the type of notification. It can be "info", "warning", "error", or "success".
    private String type;

    // This is the category of the notification, like "Quality Control", "Incubation", etc.
    private String category;

    // This is true if the user has already looked at this notification, and false if they haven't.
    private boolean isRead = false;

    // This is the exact date and time when the sticky note was written.
    private Date createdAt = new Date();
}
