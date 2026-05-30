package com.example.platformgateway.controller;


import com.example.platformgateway.model.dto.AccessTokenDTO;
import com.example.platformgateway.model.dto.LoginRequestDTO;
import com.example.platformgateway.model.dto.SignUpRequestDTO;
import com.example.platformgateway.service.AuthService;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService ;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AccessTokenDTO> login(@Validated @RequestBody LoginRequestDTO loginRequestDto){
        Pair<AccessTokenDTO , ResponseCookie> authResult = authService.authenticateClient(loginRequestDto);
        return ResponseEntity.ok().header("Set-Cookie", authResult.b.toString())
                .header("Access-Control-Allow-Credentials",Boolean.toString(true))
                .body(authResult.a);
    }

    // this is used only to sign up a SUPER_RH and the company for the first time.
    // the SUPER_RH can create other accounts later in other routes.
    @PostMapping("/signup")
    public ResponseEntity<AccessTokenDTO> signUp(@Validated @RequestBody SignUpRequestDTO signUpRequestDto){
        Pair<AccessTokenDTO , ResponseCookie> authResult = authService.registerClient(signUpRequestDto);
        return ResponseEntity.ok().header("Set-Cookie", authResult.b.toString())
                .header("Access-Control-Allow-Credentials",Boolean.toString(true))
                .body(authResult.a);
    }


    @GetMapping("/refresh")
    public ResponseEntity<AccessTokenDTO> refresh(@CookieValue(value = "refresh_token") String refreshToken ){
        AccessTokenDTO accessToken  = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok().body(accessToken);
    }
}
