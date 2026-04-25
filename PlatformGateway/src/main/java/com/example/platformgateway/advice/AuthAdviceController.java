package com.example.platformgateway.advice;

import com.example.platformgateway.controller.AuthController;
import com.example.platformgateway.exception.BadCredentialsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = { AuthController.class })
public class AuthAdviceController {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetail> badCredentials (BadCredentialsException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED,e.getMessage()),HttpStatus.UNAUTHORIZED);
    }
}
