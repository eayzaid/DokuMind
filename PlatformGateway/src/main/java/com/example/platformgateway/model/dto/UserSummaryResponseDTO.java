package com.example.platformgateway.model.dto;

import java.util.List;

public record UserSummaryResponseDTO(
        long totalNumberOfUsers,
        int totalPages,
        List<UserSummaryDTO> users
){}
