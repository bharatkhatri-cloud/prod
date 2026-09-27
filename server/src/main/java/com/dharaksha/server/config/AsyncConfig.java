package com.dharaksha.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
// This file tells the computer that it can do tasks in the background.
// For example, when we need to send an email, the server does not make the user wait.
// It sends the email in the background while the user can keep using the app.
@Configuration
@EnableAsync
public class AsyncConfig {
}
