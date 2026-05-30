package com.example.platformgateway.service;
import com.example.platformgateway.exception.BadCredentialsException;
import com.example.platformgateway.model.dto.AccessTokenDTO;
import com.example.platformgateway.model.dto.LoginRequestDTO;
import com.example.platformgateway.model.dto.SignUpRequestDTO;
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

    public Pair<AccessTokenDTO , ResponseCookie> authenticateClient(LoginRequestDTO loginRequestDTO) throws BadCredentialsException{
        return Optional.ofNullable(userRepository.getUserByEmail(loginRequestDTO.email()))
                .filter(user -> BcryptUtility.isPasswordValid(loginRequestDTO.password(), user.getPassword()))
                .map(this::buildAuthTokens)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
    }

    @Transactional
    public Pair<AccessTokenDTO , ResponseCookie> registerClient(SignUpRequestDTO signupRequestDTO) throws BadCredentialsException{

        if (userRepository.existsByEmail(signupRequestDTO.email())) {
            throw new BadCredentialsException("Email already in use: " + signupRequestDTO.email());
        }

        Company company = Company.builder()
                .name(signupRequestDTO.companyName())
                .address(signupRequestDTO.companyAddress())
                .build();

        User newUser = User.builder().firstName(signupRequestDTO.firstName())
                .lastName(signupRequestDTO.lastName())
                .email(signupRequestDTO.email())
                .password(BcryptUtility.hashPassword(signupRequestDTO.password()))
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
                .sameSite("Strict")
                .path("/auth/refresh") // it's only used for refreshing the access token ONLY
                .maxAge(7 * 24 * 3600) // 7 days
                .build();

        AccessTokenDTO accessToken = new AccessTokenDTO(jwtProvider.getAccessToken(user), user.getRole());
        return new Pair<>(accessToken, refreshToken);
    }

}
