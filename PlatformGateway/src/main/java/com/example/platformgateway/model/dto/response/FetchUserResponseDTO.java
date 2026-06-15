package com.example.platformgateway.model.dto.response;

import com.example.platformgateway.model.enums.Role;

import java.util.UUID;

public record FetchUserResponseDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role
)
{}
