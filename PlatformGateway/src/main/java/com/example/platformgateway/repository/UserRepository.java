package com.example.platformgateway.repository;

import com.example.platformgateway.model.entity.User;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface UserRepository extends CrudRepository<User , UUID> {
}
