package com.valleysoft.store.dto;

import com.valleysoft.store.entity.Role;
import com.valleysoft.store.entity.User;

public record UserResponse(Long id, String email, Role role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }
}