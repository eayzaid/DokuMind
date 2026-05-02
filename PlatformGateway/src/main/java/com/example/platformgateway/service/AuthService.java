package com.example.platformgateway.service;
import com.example.platformgateway.exception.BadCredentialsException;
import com.example.platformgateway.model.dto.AccessTokenDTO;
import com.example.platformgateway.model.dto.LoginDTO;
import com.example.platformgateway.model.dto.SignUpDTO;
import com.example.platformgateway.model.entity.Company;
import com.example.platformgateway.model.entity.User;
import com.example.platformgateway.model.enums.Role;
import com.example.platformgateway.provider.JwtProvider;
import com.example.platformgateway.repository.CompanyRepository;
import com.example.platformgateway.repository.UserRepository;
import com.example.platformgateway.utils.BcryptUtility;
import io.jsonwebtoken.Claims;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;


@Service
public class AuthService {

    private final UserRepository userRepository ;
    private final CompanyRepository companyRepository ;
    private final JwtProvider jwtProvider ;

    public AuthService(UserRepository userRepository , JwtProvider jwtProvider , CompanyRepository companyRepository){
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jwtProvider = jwtProvider;
    }

    public Pair<AccessTokenDTO , ResponseCookie> authenticateClient(LoginDTO loginDTO) throws BadCredentialsException{
        return Optional.ofNullable(userRepository.getUserByEmail(loginDTO.email()))
                .filter(user -> BcryptUtility.isPasswordValid(loginDTO.password(), user.getPassword()))
                .map(this::buildAuthTokens)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
    }

    @Transactional
    public Pair<AccessTokenDTO , ResponseCookie> registerClient(SignUpDTO signupDTO) throws BadCredentialsException{

        if (userRepository.existsByEmail(signupDTO.email())) {
            throw new BadCredentialsException("Email already in use: " + signupDTO.email());
        }

        Company company = Company.builder()
                .name(signupDTO.companyName())
                .address(signupDTO.companyAddress())
                .build();

        User newUser = User.builder().firstName(signupDTO.firstName())
                .lastName(signupDTO.lastName())
                .email(signupDTO.email())
                .password(BcryptUtility.hashPassword(signupDTO.password()))
                .role(Role.SUPER_RH)
                .build();

        companyRepository.save(company);
        userRepository.save(newUser);

        return this.buildAuthTokens(newUser);
    }

    public AccessTokenDTO refreshAccessToken(String refreshToken) throws BadCredentialsException {
        Claims claims = jwtProvider.validateRefreshToken(refreshToken);
        String clientID = claims.getSubject();
        User user = userRepository.findById(UUID.fromString(clientID)).orElseThrow(() -> new BadCredentialsException("Client not existing"));
        return new AccessTokenDTO(jwtProvider.getAccessToken(user), user.getRole());
    }

    private Pair<AccessTokenDTO, ResponseCookie> buildAuthTokens(User user) {
        ResponseCookie refreshToken = ResponseCookie.from("refresh_token", jwtProvider.getRefreshToken(user))
                .httpOnly(true)
                .secure(true)
                .path("/auth/refresh")
                .maxAge(7 * 24 * 3600) // 7 days
                .build();

        AccessTokenDTO accessToken = new AccessTokenDTO(jwtProvider.getAccessToken(user), user.getRole());
        return new Pair<>(accessToken, refreshToken);
    }

}
