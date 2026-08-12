package com.jobtracker.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Returns a JSON 401 (instead of the Spring default 403) when an unauthenticated
 * request hits a protected endpoint. The body mirrors the {@code ApiError} shape;
 * it is written directly to avoid depending on the Jackson {@code ObjectMapper}
 * bean, which is not yet available while the security chain is being built.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String body = "{\"timestamp\":\"" + Instant.now() + "\","
                + "\"status\":401,"
                + "\"code\":\"UNAUTHENTICATED\","
                + "\"message\":\"Authentication required\"}";
        response.getWriter().write(body);
    }
}
