package com.example.platformgateway.model.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    @OneToOne
    @JoinColumn(name="user_id",referencedColumnName = "id")
    User client;

    @Id
    String token;
}
