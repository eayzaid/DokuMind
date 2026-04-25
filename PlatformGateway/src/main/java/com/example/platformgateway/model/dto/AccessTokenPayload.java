package com.example.platformgateway.model.dto;

import com.example.platformgateway.model.enums.Role;

public record AccessTokenPayload(
        String user_id,
        Role role
) {}
