package com.example.platformgateway.model.enums;

import lombok.Getter;

@Getter
public enum Role {
    SUPER_RH("Super_RH"),
    RH("RH"),
    ASSISTANT("Assistant"),
    WORKER("Worker");
    
    private final String roleLabel;
    
    private Role(String roleLabel){
        this.roleLabel = roleLabel;
    }

}
