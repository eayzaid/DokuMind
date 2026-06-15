package com.example.platformgateway.exception;

// used only in the login process
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message){
        super(message);
    }
}
