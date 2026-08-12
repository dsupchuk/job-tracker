package com.jobtracker.auth;

import com.jobtracker.auth.dto.AuthResponse;
import com.jobtracker.auth.dto.LoginRequest;
import com.jobtracker.auth.dto.RefreshRequest;
import com.jobtracker.auth.dto.RegisterRequest;
import com.jobtracker.common.error.ConflictException;
import com.jobtracker.user.Role;
import com.jobtracker.user.User;
import com.jobtracker.user.UserRepository;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registration, login and refresh. Issues a fresh access/refresh token pair on
 * every successful call.
 */
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        return tokens(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        return tokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        try {
            if (!JwtService.TYPE_REFRESH.equals(jwtService.extractType(token))) {
                throw new BadCredentialsException("Not a refresh token");
            }
            User user = userRepository.findByEmail(jwtService.extractUsername(token))
                    .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
            if (!jwtService.isValid(token, user)) {
                throw new BadCredentialsException("Invalid refresh token");
            }
            return tokens(user);
        } catch (JwtException | IllegalArgumentException e) {
            throw new BadCredentialsException("Invalid refresh token");
        }
    }

    private AuthResponse tokens(User user) {
        return AuthResponse.bearer(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user));
    }
}
