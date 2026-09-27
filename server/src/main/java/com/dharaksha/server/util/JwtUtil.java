package com.dharaksha.server.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.email.secret}")
    private String emailJwtSecret;

    public String generateAuthToken(String userId) {
        long expireMs = 5L * 24 * 60 * 60 * 1000; // 5 days matching COOKIE_EXPIRE_TIME
        return JWT.create()
                .withClaim("id", userId)
                .withExpiresAt(new Date(System.currentTimeMillis() + expireMs))
                .sign(Algorithm.HMAC256(jwtSecret));
    }

    public String verifyAuthToken(String token) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(jwtSecret)).build();
        DecodedJWT decoded = verifier.verify(token);
        return decoded.getClaim("id").asString();
    }

    public String generateEmailToken(Map<String, Object> userMap) {
        long expireMs = 5L * 60 * 1000; // 5 minutes matching Node.js email token expire
        return JWT.create()
                .withClaim("userId", userMap)
                .withExpiresAt(new Date(System.currentTimeMillis() + expireMs))
                .sign(Algorithm.HMAC256(emailJwtSecret));
    }

    public Map<String, Object> verifyEmailToken(String token) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(emailJwtSecret)).build();
        DecodedJWT decoded = verifier.verify(token);
        return decoded.getClaim("userId").asMap();
    }
}
