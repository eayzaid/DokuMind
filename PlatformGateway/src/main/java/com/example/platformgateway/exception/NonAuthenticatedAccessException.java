package com.example.platformgateway.exception;

// used only in the login process
public class NonAuthenticatedAccessException extends RuntimeException {
    public NonAuthenticatedAccessException(String message){
        super(message);
    }
}
