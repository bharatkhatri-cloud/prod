package com.dharaksha.server.config;

import com.dharaksha.server.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

import java.security.Principal;
import java.util.List;

// This class configures the WebSocket message broker.
// Think of it like mapping roads and signs so letters get sent to the right houses.
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    // This configures our broker so clients can subscribe to topics or queues.
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Topics are for broadcasting to everyone. Queues are for private user messages.
        config.enableSimpleBroker("/topic", "/queue");
        
        // This is the prefix for messages sent from the client to our server.
        config.setApplicationDestinationPrefixes("/app");
        
        // This prefix is for sending messages to a single specific logged-in user.
        config.setUserDestinationPrefix("/user");
    }

    // This sets up the URL endpoint where the client dials in to connect.
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/notifications")
                .setAllowedOrigins("*");
    }

    // This is like a guard at the gate. It checks the token before letting the client connect.
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                // We only check credentials when the client is trying to connect.
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Pull the token from connection headers.
                    String token = accessor.getFirstNativeHeader("token");
                    
                    // If not in header, try parameter query (handy if client sends it in link query).
                    if (token == null) {
                        List<String> nativeHeaders = accessor.getNativeHeader("token");
                        if (nativeHeaders != null && !nativeHeaders.isEmpty()) {
                            token = nativeHeaders.get(0);
                        }
                    }

                    if (token != null) {
                        try {
                            String userId = jwtUtil.verifyAuthToken(token);
                            if (userId != null && !userId.isEmpty()) {
                                // Save the user details on the session connection.
                                accessor.setUser(new Principal() {
                                    @Override
                                    public String getName() {
                                        return userId;
                                    }
                                });
                                log.info("WebSocket user {} authenticated successfully.", userId);
                            }
                        } catch (Exception e) {
                            log.warn("WebSocket token authentication failed: {}", e.getMessage());
                        }
                    }
                }
                return message;
            }
        });
    }
}
