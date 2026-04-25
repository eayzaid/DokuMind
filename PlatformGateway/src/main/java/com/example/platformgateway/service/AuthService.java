package com.example.platformgateway.service;
import com.example.platformgateway.model.dto.AccessTokenDTO;
import com.example.platformgateway.model.dto.LoginDTO;
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

    public Optional<Pair<AccessTokenDTO , ResponseCookie>> authenticateClient(LoginDTO loginDTO){
        return Optional.ofNullable(userRepository.getUserByEmail(loginDTO.email()))
                .filter(user -> BcryptUtility.isPasswordValid(loginDTO.password(), user.getPassword()))
                .map(user -> {
                    ResponseCookie refreshToken = ResponseCookie.from("refresh_token", jwtProvider.getRefreshToken(user))
                            .httpOnly(true)
                            .secure(true)
                            .path("/api/auth/refresh")
                            .maxAge(7 * 24 * 3600) // 7 days
                            .build();
                    return new Pair<>(new AccessTokenDTO(jwtProvider.getAccessToken(user), user.getRole()),refreshToken);
                });
    }


}
