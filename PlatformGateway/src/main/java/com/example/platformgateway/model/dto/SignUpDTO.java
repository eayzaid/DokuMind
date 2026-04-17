package com.example.platformgateway.model.dto;

public record SignUpDTO(
        String firstName,
        String lastName,
        String companyName,
        String companyAddress,
        String email,
        String password
) { }
