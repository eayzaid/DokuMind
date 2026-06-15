package com.example.platformgateway.model.dto.response;

import java.util.List;

public record UserSummaryResponseDTO(
        long totalNumberOfUsers,
        int totalPages,
        List<UserSummaryDTO> users
){}
