package com.example.platformgateway.model.entity;
import com.example.platformgateway.model.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;

    private String firstName ;
    private String lastName ;
    private String email ;
    private String password ;
    private Role role ;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company ;
}
