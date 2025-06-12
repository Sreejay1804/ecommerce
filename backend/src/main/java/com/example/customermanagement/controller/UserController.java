package com.example.customermanagement.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.customermanagement.model.User;
import com.example.customermanagement.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Adjust if needed
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null) {
            return Collections.singletonMap("success", false);
        }
        if (userRepository.existsByUsername(username)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Username already exists");
            return response;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // In production, hash the password!
        userRepository.save(user);
        return Collections.singletonMap("success", true);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Username and password required");
            return response;
        }
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("username", username);
            return response;
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid credentials");
            return response;
        }
    }
}