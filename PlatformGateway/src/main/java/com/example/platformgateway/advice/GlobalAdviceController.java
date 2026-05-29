package com.example.platformgateway.advice;

import com.example.platformgateway.exception.NonAuthenticatedAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice()
public class GlobalAdviceController {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> badCredentials (MethodArgumentNotValidException e){
        return new ResponseEntity<>(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,e.getMessage()),HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> badCredentials (MethodArgumentTypeMismatchException e){
        return new ResponseEntity<>(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,e.getMessage()),HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NonAuthenticatedAccessException.class)
    public ResponseEntity<ProblemDetail> badCredentials (NonAuthenticatedAccessException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED,e.getMessage()),HttpStatus.UNAUTHORIZED);
    }

}
