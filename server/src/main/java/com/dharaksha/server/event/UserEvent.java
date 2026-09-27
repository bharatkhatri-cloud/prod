package com.dharaksha.server.event;

import com.dharaksha.server.model.User;
import lombok.Getter;

// This is a special envelope specifically for user-related notifications (like welcoming a new user).
@Getter
public class UserEvent extends BaseNotificationEvent {
    // The user who is registered or accessed.
    private final User user;
    
    // Extra information, like a link to verify their account.
    private final String extraData; 
    
    // The email address where we want to send this notification.
    private final String recipientEmail;

    public UserEvent(Object source, String eventType, User user, String extraData, String recipientEmail) {
        super(source, eventType);
        this.user = user;
        this.extraData = extraData;
        this.recipientEmail = recipientEmail;
    }
}
