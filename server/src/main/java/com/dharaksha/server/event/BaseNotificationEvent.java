package com.dharaksha.server.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

// This is a basic blueprint for all notification messages in our server.
// Think of it like a blank envelope where we write what kind of letter it is.
@Getter
public abstract class BaseNotificationEvent extends ApplicationEvent {
    // This tells us what kind of event happened (like "WELCOME" or "ALERT").
    private final String eventType;

    public BaseNotificationEvent(Object source, String eventType) {
        super(source); // Tells the main computer program who sent this message.
        this.eventType = eventType;
    }
}
