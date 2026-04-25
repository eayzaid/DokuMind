package com.example.platformgateway.repository;
import com.example.platformgateway.model.entity.RefreshToken;
import com.example.platformgateway.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, User> {
}
