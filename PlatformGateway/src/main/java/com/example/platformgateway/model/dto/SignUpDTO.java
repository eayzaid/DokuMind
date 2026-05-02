package com.example.platformgateway.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SignUpDTO(
        @JsonProperty("first_name")
        String firstName,
        @JsonProperty("last_name")
        String lastName,
        @JsonProperty("company_name")
        String companyName,
        @JsonProperty("company_address")
        String companyAddress,
        String email,
        String password
) { }
