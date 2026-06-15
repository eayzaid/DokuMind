package com.example.platformgateway.model.dto.common;

import com.example.platformgateway.model.enums.Role;

public record AccessTokenPayload(
        String user_id,
        Role role
) {}
