package com.valleysoft.store.service;

import com.valleysoft.store.dto.CreateCustomerRequest;
import com.valleysoft.store.entity.Role;
import com.valleysoft.store.entity.User;
import com.valleysoft.store.exception.EmailAlreadyExistsException;
import com.valleysoft.store.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createCustomer(CreateCustomerRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException();
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setActive(true);
        return userRepository.save(user);
    }

    public User getByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = getByEmail(username);
        if (!user.isActive()) {
            throw new DisabledException("Invalid email or password");
        }

        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .build();
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}