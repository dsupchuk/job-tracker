package com.jobtracker.auth.dto;

/**
 * Token pair returned by register / login / refresh.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType
) {
    public static AuthResponse bearer(String accessToken, String refreshToken) {
        return new AuthResponse(accessToken, refreshToken, "Bearer");
    }
}
