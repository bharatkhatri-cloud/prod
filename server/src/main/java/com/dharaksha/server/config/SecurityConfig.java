package com.dharaksha.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource, JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/health/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/v2s/chamber/**").permitAll()
                .requestMatchers("/api/v2s/mould-filling/**").permitAll()
                .requestMatchers("/api/v2s/humidifier/**").permitAll()
                .requestMatchers("/api/v2s/oven-ops/**").permitAll()
                .requestMatchers("/api/v2s/oven-in/**").permitAll()
                .requestMatchers("/api/v2s/oven-out/**").permitAll()
                .requestMatchers("/api/v2s/batch/**").permitAll()
                .requestMatchers("/api/v2s/smfg/**").permitAll()
                .requestMatchers("/api/v2s/settings/**").permitAll()
                .requestMatchers("/api/v2s/dashboard/**").permitAll()
                .requestMatchers("/api/v2s/login").permitAll()
                .requestMatchers("/api/v2s/logout").permitAll()
                .requestMatchers("/api/v2s/admin/**").hasRole("Admin")
                .anyRequest().authenticated());

        return http.build();
    }
}
