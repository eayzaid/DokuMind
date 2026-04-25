package com.example.platformgateway.service;
import com.example.platformgateway.exception.BadCredentialsException;
import com.example.platformgateway.model.dto.AccessTokenDTO;
import com.example.platformgateway.model.dto.LoginDTO;
import com.example.platformgateway.model.entity.User;
import com.example.platformgateway.provider.JwtProvider;
import com.example.platformgateway.repository.UserRepository;
import com.example.platformgateway.utils.BcryptUtility;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class AuthService {

    private final UserRepository userRepository ;
    private final JwtProvider jwtProvider ;

    public AuthService(UserRepository userRepository , JwtProvider jwtProvider){
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    public Pair<AccessTokenDTO , ResponseCookie> authenticateClient(LoginDTO loginDTO) throws BadCredentialsException{
        return Optional.ofNullable(userRepository.getUserByEmail(loginDTO.email()))
                .filter(user -> BcryptUtility.isPasswordValid(loginDTO.password(), user.getPassword()))
                .map(this::buildAuthTokens)
                .orElseThrow(() -> new BadCredentialsException(loginDTO.email()));
    }

    private Pair<AccessTokenDTO, ResponseCookie> buildAuthTokens(User user) {
        ResponseCookie refreshToken = ResponseCookie.from("refresh_token", jwtProvider.getRefreshToken(user))
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 3600) // 7 days
                .build();

        AccessTokenDTO accessToken = new AccessTokenDTO(jwtProvider.getAccessToken(user), user.getRole());
        return new Pair<>(accessToken, refreshToken);
    }

}
