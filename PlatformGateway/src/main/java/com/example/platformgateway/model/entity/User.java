package com.example.platformgateway.model.entity;
import com.example.platformgateway.model.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

// the client name was necessary as the "user" name is reserved for postgres
@Entity(name="client")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @OneToOne(mappedBy = "client", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private RefreshToken refreshToken;
}
