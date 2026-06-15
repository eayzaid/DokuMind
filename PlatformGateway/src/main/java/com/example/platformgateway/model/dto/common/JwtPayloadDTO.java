package com.example.platformgateway.model.dto.common;

import com.example.platformgateway.model.enums.Role;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record JwtPayloadDTO(
        @NotBlank(message = "User ID is required")
        UUID userId,
        Role role,
        @NotBlank(message = "Company ID is required")
        UUID companyId
) {}
