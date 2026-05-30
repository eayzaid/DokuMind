package com.example.platformgateway.exception;

// used only in the login process
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message){
        super(message);
    }
}
