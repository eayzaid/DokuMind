package com.example.platformgateway.model.dto.response;
import com.example.platformgateway.model.enums.Role;

public record AccessTokenDTO (
        String accessToken ,
        Role role
){}
