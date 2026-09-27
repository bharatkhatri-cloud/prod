package com.dharaksha.server.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final Environment env;

    public String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getName();
        }

        boolean isDev = false;
        for (String profile : env.getActiveProfiles()) {
            if ("development".equalsIgnoreCase(profile) || "dev".equalsIgnoreCase(profile)) {
                isDev = true;
                break;
            }
        }
        if (isDev) {
            return "Ankit Kumar";
        }

        return null;
    }
}
