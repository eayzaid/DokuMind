package com.example.platformgateway.model.dto;

import com.example.platformgateway.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record CreateUserRequestDTO(
        @NotBlank(message = "First name is required")
        String firstName ,
        @NotBlank(message = "Last name is required")
        String lastName ,
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        String email ,
        Role role
){}
