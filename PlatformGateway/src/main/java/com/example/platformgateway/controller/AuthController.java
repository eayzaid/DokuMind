package com.example.platformgateway.controller;


import com.example.platformgateway.model.dto.AccessTokenDTO;
import com.example.platformgateway.model.dto.LoginDTO;
import com.example.platformgateway.model.dto.SignUpDTO;
import com.example.platformgateway.service.AuthService;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<AccessTokenDTO> login(@Validated @RequestBody LoginDTO loginDto ){
        Pair<AccessTokenDTO , ResponseCookie> authResult = authService.authenticateClient(loginDto);
        return ResponseEntity.ok().header("Set-Cookie", authResult.b.toString()).body(authResult.a);
    }
/*
    @PostMapping("/signup")
    public ResponseEntity<AccessTokenDTO> signUp(@Validated @RequestBody SignUpDTO SignUpDto ){
    }

    @GetMapping("/refresh")
    public ResponseEntity<AccessTokenDTO> refresh(@CookieValue(value = "refresh_token") String refreshToken  ){
    }

 */
}
