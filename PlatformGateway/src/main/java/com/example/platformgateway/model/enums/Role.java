package com.example.platformgateway.model.enums;

import lombok.Getter;

@Getter
public enum Role {
    SUPER_RH("SUPER_RH"),
    RH("RH"),
    ASSISTANT("ASSISTANT"),
    WORKER("WORKER");
    
    private final String roleLabel;
    
    private Role(String roleLabel){
        this.roleLabel = roleLabel;
    }

}
