package com.example.platformgateway.model.dto;

import com.example.platformgateway.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequestDTO(
        @JsonProperty("first_name")
        @NotBlank(message = "First name is required")
        String firstName,
        @JsonProperty("last_name")
        @NotBlank(message = "Last name is required")
        String lastName,
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        String email,
        @NotNull(message = "Role is required")
        Role role
){}
