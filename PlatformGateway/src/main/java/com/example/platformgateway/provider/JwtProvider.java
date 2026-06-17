package com.example.platformgateway.provider;
import com.example.platformgateway.exception.TokenValidityException;
import com.example.platformgateway.model.dto.common.JwtPayloadDTO;
import com.example.platformgateway.model.entity.RefreshToken;
import com.example.platformgateway.model.entity.User;
import com.example.platformgateway.model.enums.Role;
import com.example.platformgateway.repository.RefreshTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtProvider {

    private final RefreshTokenRepository refreshTokenRepository ;

    @Value("${application.secret.access_token}")
    private String accessTokenSecret;

    @Value("${application.secret.refresh_token}")
    private String refreshTokenSecret;

    @Value("${application.expiration.access_token}")
    Long accessTokenExpirationSeconds;

    @Value("${application.expiration.refresh_token}")
    Long refreshTokenExpirationSeconds;


    public JwtProvider ( RefreshTokenRepository refreshTokenRepository ){
        this.refreshTokenRepository = refreshTokenRepository;
    }

    private SecretKey getSecret(String secret){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    private String getToken(User user , String secret , Long expirationSeconds ){
        return Jwts.builder()
                .subject(user.getId().toString())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(expirationSeconds)))
                .claim("role", user.getRole().name())
                .claim("companyId", user.getCompany().getId())
                .signWith(getSecret(secret))
                .compact();
    }

    public String getAccessToken(User user){
        return getToken(user,accessTokenSecret,this.accessTokenExpirationSeconds);
    }

    @Transactional
    public String getRefreshToken(User user){
        String token = getToken(user,refreshTokenSecret,this.refreshTokenExpirationSeconds);
        RefreshToken refreshTokenRecord = RefreshToken.builder().token(token).client(user).build();
        refreshTokenRepository.deleteByClient(user);
        refreshTokenRepository.save(refreshTokenRecord);
        return token;
    }

    public Claims validateRefreshToken (String refreshToken) throws TokenValidityException {
        try {
            if( refreshTokenRepository.findByToken(refreshToken) == null){
                throw new TokenValidityException("Token has expired");
            }
            return Jwts.parser()
                    .verifyWith(getSecret(refreshTokenSecret))
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();
        }catch (ExpiredJwtException e){
            throw new TokenValidityException("Token has expired");
        }catch (JwtException e){
            throw new TokenValidityException("Token is invalid");
        }
    }

    public JwtPayloadDTO decodeToken(String token) throws TokenValidityException{
        try {
            Claims decodedTokenClaims = Jwts.parser()
                    .verifyWith(getSecret(accessTokenSecret))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return new JwtPayloadDTO(
                    UUID.fromString(decodedTokenClaims.getSubject()),
                    Role.valueOf(decodedTokenClaims.get("role", String.class)),
                    UUID.fromString(decodedTokenClaims.get("companyId", String.class)));
        }catch (ExpiredJwtException e){
            throw new TokenValidityException("Token has expired");
        }catch (JwtException e){
            throw new TokenValidityException("Token is invalid");
        }
    }

}
