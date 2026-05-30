package com.example.platformgateway.repository;

import com.example.platformgateway.model.entity.Company;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface CompanyRepository extends CrudRepository<Company, UUID> {
}
