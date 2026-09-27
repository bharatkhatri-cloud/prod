package com.dharaksha.server.controller;

import com.dharaksha.server.model.User;
import com.dharaksha.server.service.UserService;
import com.dharaksha.server.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v2s")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/admin/createNewUser")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        try {
            User user = new User();
            user.setName(body.get("name"));
            user.setEmail(body.get("email"));
            user.setRole(body.get("role"));
            user.setPassword(body.get("password"));

            String cfmPassword = body.get("cfmPassword");

            User createdUser = userService.createUser(user, cfmPassword);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User Added Successfully");
            response.put("userData", createdUser);

            return ResponseEntity.status(201).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(403).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/admin/getAllUsers")
    public ResponseEntity<?> getUsers(@RequestParam(defaultValue = "1") int page) {
        try {
            Map<String, Object> result = userService.getUsers(page);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/admin/userDelete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            User loggedInUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User deletedUser = userService.deleteUser(id, loggedInUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User has been deleted");
            response.put("deleteResponse", deletedUser);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(403).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");

            if (email == null || password == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Please Enter Email & Password");
                return ResponseEntity.status(404).body(response);
            }

            Map<String, Object> loginResult = userService.login(email, password);
            String token = (String) loginResult.get("token");
            User user = (User) loginResult.get("user");

            ResponseCookie cookie = ResponseCookie.from("dhaDbTkn", token)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("None")
                    .maxAge(5L * 24 * 60 * 60)
                    .path("/")
                    .build();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "You have successfully logged in, Mr./Ms. \"" + user.getName() + "\".");
            response.put("success", true);
            response.put("user", user);
            response.put("dhaDbTkn", token);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("dhaDbTkn", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .maxAge(0)
                .path("/")
                .build();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout Out");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> loggedInUserProfile(HttpServletRequest request) {
        try {
            User loggedInUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String dhaDbTkn = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("dhaDbTkn".equals(cookie.getName())) {
                        dhaDbTkn = cookie.getValue();
                        break;
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loggedInUser", loggedInUser);
            response.put("dhaDbTkn", dhaDbTkn);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Please Login to access this data");
            return ResponseEntity.status(404).body(response);
        }
    }

    @GetMapping("/admin/sendUserInfoEmail")
    public ResponseEntity<?> sendUserInfoEmail(@RequestParam String email) {
        try {
            User loggedInAdmin = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            userService.sendUserInfoEmail(email, loggedInAdmin);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User info sent to this email " + loggedInAdmin.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/admin/accessUserInfo")
    public ResponseEntity<?> accessUserInfo(@RequestParam String token) {
        try {
            if (token == null || token.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid or expired link");
                return ResponseEntity.status(400).body(response);
            }

            Map<String, Object> userMap = jwtUtil.verifyEmailToken(token);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", userMap);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid or expired link");
            return ResponseEntity.status(400).body(response);
        }
    }
}
