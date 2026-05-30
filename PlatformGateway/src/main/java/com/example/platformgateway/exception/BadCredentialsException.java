package com.example.platformgateway.exception;

// used only in the login process
public class BadCredentialsException extends RuntimeException {
    public BadCredentialsException(String message){
        super(message);
    }
}
