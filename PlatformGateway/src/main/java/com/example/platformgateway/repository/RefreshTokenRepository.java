package com.example.platformgateway.repository;
import com.example.platformgateway.model.entity.RefreshToken;
import com.example.platformgateway.model.entity.User;
import org.springframework.data.repository.CrudRepository;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    public RefreshToken findByToken(String Token);
    public void flush();
    void deleteByClient(User client);
}
