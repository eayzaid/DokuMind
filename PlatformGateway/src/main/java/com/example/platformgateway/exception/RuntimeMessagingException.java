package com.example.platformgateway.exception;

// used only in the login process
public class RuntimeMessagingException extends RuntimeException {
    public RuntimeMessagingException(String message){
        super(message);
    }
}
