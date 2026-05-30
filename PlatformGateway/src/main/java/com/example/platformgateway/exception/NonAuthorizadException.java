package com.example.platformgateway.exception;

// used only in the login process
public class NonAuthorizadException extends RuntimeException {
    public NonAuthorizadException(String message){
        super(message);
    }
}
