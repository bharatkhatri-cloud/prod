package com.dharaksha.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.SesV2ClientBuilder;

// This file connects our server to Amazon Web Services (AWS) so we can send emails.
// Think of it like buying stamps and setting up a mailbox so our letters can go out.
@Configuration
public class SesConfig {

    // These keys are like our secret ID card and password for AWS.
    // They prove to AWS that we are allowed to use their email service.
    @Value("${aws.s3.accessKey}")
    private String accessKey;

    @Value("${aws.s3.secretKey}")
    private String secretKey;

    // This is the location of the computer server we are using (like a post office location).
    @Value("${aws.ses.region:ap-south-1}")
    private String region;

    // This creates the "Email Helper" (SesV2Client) that our code will use to send emails.
    @Bean
    public SesV2Client sesV2Client() {
        String cleanAccessKey = (accessKey != null) ? accessKey.trim() : "";
        String cleanSecretKey = (secretKey != null) ? secretKey.trim() : "";
        String cleanRegion = (region != null) ? region.trim() : "ap-south-1";

        SesV2ClientBuilder builder = SesV2Client.builder()
                .region(Region.of(cleanRegion));

        // If we wrote secret keys in our settings, use them!
        if (!cleanAccessKey.isEmpty() && !cleanAccessKey.startsWith("${") &&
            !cleanSecretKey.isEmpty() && !cleanSecretKey.startsWith("${")) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(cleanAccessKey, cleanSecretKey)));
        } else {
            // Otherwise, ask AWS to find the credentials automatically.
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }
}
