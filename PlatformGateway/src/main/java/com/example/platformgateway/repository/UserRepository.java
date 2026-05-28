package com.example.platformgateway.repository;

import com.example.platformgateway.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User , UUID> {
    public User getUserByEmail(String email);
    public Boolean existsByEmail (String email);
    Page<User> findAll (Pageable pageable);
}
