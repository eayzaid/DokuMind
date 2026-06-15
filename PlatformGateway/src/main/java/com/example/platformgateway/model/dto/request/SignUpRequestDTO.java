package com.example.platformgateway.model.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignUpRequestDTO(
        @JsonProperty("first_name")
        @NotBlank(message = "First name is required")
        String firstName,
        @JsonProperty("last_name")
        @NotBlank(message = "Last name is required")
        String lastName,
        @JsonProperty("company_name")
        @NotBlank(message = "Company name is required")
        String companyName,
        @JsonProperty("company_address")
        @NotBlank(message = "Company Address is required")
        String companyAddress,
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        String email,
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password
) { }
