package com.example.platformgateway.model.entity;
import com.example.platformgateway.model.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

// the client name was necessary as the "user" name is reserved for postgres
@Entity(name="client")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;

    private String firstName ;
    private String lastName ;

    @Column(unique = true)
    private String email ;

    private String password ;

    @Enumerated(EnumType.STRING)
    private Role role ;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company ;
}
