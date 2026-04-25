package com.example.platformgateway.model.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "refresh_token")
@Data
public class RefreshToken {
    @OneToOne
    @JoinColumn(name="user_id",referencedColumnName = "id")
    User client;

    @Id
    String token;
}
