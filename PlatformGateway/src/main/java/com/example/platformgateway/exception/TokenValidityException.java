package com.example.platformgateway.exception;

public class TokenValidityException extends RuntimeException {
    public TokenValidityException(String message) {
        super("Token is not valid : " + message);
    }
}
