package com.example.platformgateway.provider;
import com.example.platformgateway.model.entity.User;
import com.example.platformgateway.repository.RefreshTokenRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtProvider {

    private final RefreshTokenRepository refreshTokenRepository ;

    @Value("${application.secret.access_token}")
    private String accessTokenSecret;

    @Value("${application.secret.refresh_token}")
    private String refreshTokenSecret;

    public JwtProvider ( RefreshTokenRepository refreshTokenRepository ){
        this.refreshTokenRepository = refreshTokenRepository;
    }

    private SecretKey getSecret(String secret){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    private String getToken(User user , String secret){
        return Jwts.builder()
                .subject(user.getId().toString())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .claim("role", user.getRole().name())
                .signWith(getSecret(secret))
                .compact();
    }

    public String getAccessToken(User user){
        return getToken(user,accessTokenSecret);
    }

    public String getRefreshToken(User user){
        return getToken(user,refreshTokenSecret);
    }

}
