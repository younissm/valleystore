package com.valleysoft.store.controller;

import com.valleysoft.store.dto.AuthResponse;
import com.valleysoft.store.dto.CreateCustomerRequest;
import com.valleysoft.store.dto.LoginRequest;
import com.valleysoft.store.dto.UserResponse;
import com.valleysoft.store.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public UserResponse register(@RequestBody @Valid CreateCustomerRequest request) {
        return authService.registerCustomer(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }
}