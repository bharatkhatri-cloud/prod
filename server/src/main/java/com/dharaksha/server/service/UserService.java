package com.dharaksha.server.service;

import com.dharaksha.server.model.User;
import com.dharaksha.server.repository.UserRepository;
import com.dharaksha.server.util.CryptoJSUtil;
import com.dharaksha.server.util.JwtUtil;
import com.dharaksha.server.event.UserEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ApplicationEventPublisher eventPublisher;

    // We read the frontend website address from settings so email links work in production.
    @Value("${frontend.url:https://dharakshaproduction.shop/}")
    private String frontendUrl;

    private static final String AES_SECRET = "dharaksha_hashing-123";

    public User createUser(User userData, String cfmPassword) throws Exception {
        if (userRepository.findByEmail(userData.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email Already Taken");
        }

        if (userData.getPassword() == null || !userData.getPassword().equals(cfmPassword)) {
            throw new IllegalArgumentException("Password not match");
        }

        // Encrypt password using CryptoJS equivalent before saving
        String encryptedPassword = CryptoJSUtil.encrypt(userData.getPassword(), AES_SECRET);
        userData.setPassword(encryptedPassword);
        userData.setCreated_on(new Date());
        userData.setIsActive(true);
        userData.setUpdated_at(new Date());

        User savedUser = userRepository.save(userData);
        // This line shouts out to the server: "Hey! A new user was created! Please send them a welcome email!"
        // The server hears this and handles it in the background so the user gets registered quickly.
        eventPublisher.publishEvent(new UserEvent(this, "WELCOME", savedUser, null, savedUser.getEmail()));
        return savedUser;
    }

    public Map<String, Object> getUsers(int page) {
        Pageable pageable = PageRequest.of(page - 1, 50);
        List<User> usersData = userRepository.findByIsActive(true, pageable);
        long totalUserData = userRepository.count();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Users data");
        response.put("totalCount", usersData.size());
        response.put("totalUserData", totalUserData);
        response.put("usersData", usersData);
        return response;
    }

    public User deleteUser(String id, String loggedInUserId) {
        if (id.equals(loggedInUserId)) {
            throw new IllegalArgumentException("You Can't Delete Yourself");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User Not Found"));

        user.setIsActive(false);
        user.setUpdated_at(new Date());
        return userRepository.save(user);
    }

    public Map<String, Object> login(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Unauthorized attempt: External users are restricted; kindly contact the admin for assistance."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalArgumentException("Unauthorized attempt: External users are restricted; kindly contact the admin for assistance.");
        }

        String decryptedStoredPassword;
        try {
            decryptedStoredPassword = CryptoJSUtil.decrypt(user.getPassword(), AES_SECRET);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (email.equals(user.getEmail()) && password.equals(decryptedStoredPassword)) {
            String token = jwtUtil.generateAuthToken(user.getId());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("user", user);
            return result;
        } else {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }

    public void sendUserInfoEmail(String email, User loggedInAdmin) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        // Decrypt password
        String decryptedPassword = CryptoJSUtil.decrypt(user.getPassword(), AES_SECRET);

        // Generate email JWT
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("_id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("password", decryptedPassword);
        userMap.put("created_on", user.getCreated_on() != null ? user.getCreated_on().getTime() : null);

        String token = jwtUtil.generateEmailToken(userMap);

        // We make sure the address ends with a slash so the link builds correctly.
        String baseUrl = frontendUrl.endsWith("/") ? frontendUrl : frontendUrl + "/";
        String accessLink = baseUrl + "access-user-info?token=" + token;

        // This line shouts out to the server: "Hey! An admin needs to access a user's details! Please send them the secret link email!"
        // The server hears this and handles it in the background.
        eventPublisher.publishEvent(new UserEvent(this, "ADMIN_ACCESS", user, accessLink, loggedInAdmin.getEmail()));
    }
}
