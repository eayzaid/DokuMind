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

    @org.springframework.data.jpa.repository.Query(
            """
            select u from client u
            where (lower(u.firstName) like lower(concat('%', :firstName, '%')) or :firstName is null )
              and (lower(u.lastName) like lower(concat('%', :lastName, '%')) or :lastName is null)
              and (:companyId = u.company.id)
              and (:role is null or u.role = :role)
            """
    )
    Page<User> findFiltered(
            @org.springframework.data.repository.query.Param("firstName") String firstName,
            @org.springframework.data.repository.query.Param("lastName") String lastName,
            @org.springframework.data.repository.query.Param("role") com.example.platformgateway.model.enums.Role role,
            @org.springframework.data.repository.query.Param("companyId") UUID companyId,
            Pageable pageable
    );
}
