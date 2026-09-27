package com.dharaksha.server.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.*;

import java.util.List;

// This service acts like our mail carrier that physically takes a letter, writes the address,
// and sends it to the post office (AWS SES) so it gets delivered.
@Slf4j
@Service
public class NotificationService {

    // The SES client that connects to Amazon Web Services.
    private final SesV2Client sesV2Client;
    
    // The email address that the letter is sent from (noreply@dharakshaproduction.shop).
    private final String senderEmail;

    @Autowired
    public NotificationService(SesV2Client sesV2Client, 
                               @Value("${aws.ses.sender}") String senderEmail) {
        this.sesV2Client = sesV2Client;
        this.senderEmail = senderEmail;
    }

    // This method takes a list of email addresses, a subject, and the HTML letter content and sends it.
    public void sendHtmlEmail(List<String> recipients, String subject, String htmlContent) {
        // If there is no one to send it to, stop right here.
        if (recipients == null || recipients.isEmpty()) {
            log.warn("No recipients specified for email: {}", subject);
            return;
        }

        try {
            log.info("Sending email to: {} with subject: {}", recipients, subject);
            
            // Build the envelope (SendEmailRequest) with:
            // 1. From address
            // 2. To addresses
            // 3. Subject title
            // 4. HTML letter body
            SendEmailRequest request = SendEmailRequest.builder()
                    .fromEmailAddress(senderEmail)
                    .destination(Destination.builder().toAddresses(recipients).build())
                    .content(EmailContent.builder()
                            .simple(Message.builder()
                                    .subject(Content.builder().data(subject).charset("UTF-8").build())
                                    .body(Body.builder()
                                            .html(Content.builder().data(htmlContent).charset("UTF-8").build())
                                            .build())
                                    .build())
                            .build())
                    .build();

            // Give the envelope to AWS SES to send it.
            SendEmailResponse response = sesV2Client.sendEmail(request);
            log.info("Email successfully sent. Message ID: {}", response.messageId());
        } catch (SesV2Exception e) {
            // Log any errors if AWS SES gets angry or rejects the mail.
            log.error("AWS SES failed to send email to {}: {}", recipients, e.awsErrorDetails().errorMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Failed to send email to {} via AWS SES", recipients, e);
            throw e;
        }
    }
}
