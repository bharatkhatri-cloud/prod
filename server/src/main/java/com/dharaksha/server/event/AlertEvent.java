package com.dharaksha.server.event;

import lombok.Getter;

// This is a special envelope for system alerts, warnings, or errors (like when a machine is broken).
@Getter
public class AlertEvent extends BaseNotificationEvent {
    // The title of the email (like "Danger: Too Hot!").
    private final String subject;
    
    // The details of the issue (like "Chamber 3 is at 50 degrees instead of 20").
    private final String alertMessage;
    
    // How bad the issue is (like INFO, WARNING, or CRITICAL).
    private final String severity; 

    public AlertEvent(Object source, String eventType, String subject, String alertMessage, String severity) {
        //! this will call the parent class constructor to set the source and eventType
        super(source, eventType);
        this.subject = subject;
        this.alertMessage = alertMessage;
        this.severity = severity;
    }
}
