package com.example.nexus.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private String accessToken;
    private String refreshToken;
    private String role;
    private Integer userId;

    // Constructor for simple responses (without tokens)
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Constructor for login responses
    public AuthResponse(boolean success, String message, String role, Integer userId) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.userId = userId;
    }
}