package com.valleysoft.store.service;

import com.valleysoft.store.dto.AuthResponse;
import com.valleysoft.store.dto.CreateCustomerRequest;
import com.valleysoft.store.dto.LoginRequest;
import com.valleysoft.store.dto.UserResponse;
import com.valleysoft.store.entity.User;
import com.valleysoft.store.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final CustomerService customerService;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserResponse registerCustomer(CreateCustomerRequest request) {
        User user = userService.createCustomer(request);
        customerService.createProfile(user, request);
        return UserResponse.from(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userService.getByEmail(email);

        return new AuthResponse(
                jwtUtil.createToken(authentication),
                "Bearer",
                JwtUtil.ACCESS_TOKEN_VALIDITY_SECONDS,
                UserResponse.from(user));
    }
}