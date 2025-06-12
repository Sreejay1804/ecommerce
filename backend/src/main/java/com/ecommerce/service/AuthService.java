package com.ecommerce.service;

import com.ecommerce.dto.AuthRequest;
import com.ecommerce.dto.AuthResponse;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public ResponseEntity<?> signup(AuthRequest request) {
        try {
            // Validate email
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new AuthResponse(false, "Email already exists", null));
            }

            // Create new user
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail().toLowerCase());
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            User savedUser = userRepository.save(user);
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(savedUser.getEmail());

            return ResponseEntity.ok(new AuthResponse(
                true,
                "User registered successfully",
                token
            ));

        } catch (Exception e) {
            log.error("Error during signup: ", e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse(false, "Error creating account", null));
        }
    }

    public ResponseEntity<?> login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtTokenProvider.generateToken(user.getEmail());

            return ResponseEntity.ok(new AuthResponse(
                true,
                "Login successful",
                token
            ));

        } catch (Exception e) {
            log.error("Error during login: ", e);
            return ResponseEntity.badRequest()
                .body(new AuthResponse(false, "Invalid credentials", null));
        }
    }
}