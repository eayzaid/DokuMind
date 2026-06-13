package com.example.platformgateway.advice;

import com.example.platformgateway.exception.BadRequestException;
import com.example.platformgateway.exception.NonAuthenticatedAccessException;
import com.example.platformgateway.exception.NonAuthorizadException;
import com.example.platformgateway.exception.TokenValidityException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalAdviceController {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> methodArgumentNotValid (MethodArgumentNotValidException e){
        return new ResponseEntity<>(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,e.getMessage()),HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> methodArgumentTypeMismatch (MethodArgumentTypeMismatchException e){
        return new ResponseEntity<>(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,e.getMessage()),HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NonAuthenticatedAccessException.class)
    public ResponseEntity<ProblemDetail> nonAuthenticatedAccess (NonAuthenticatedAccessException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED,e.getMessage()),HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(TokenValidityException.class)
    public ResponseEntity<ProblemDetail> nonAuthenticatedAccess (TokenValidityException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED,e.getMessage()),HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ProblemDetail> badRequest (BadRequestException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,e.getMessage()),HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NonAuthorizadException.class)
    public ResponseEntity<ProblemDetail> nonAuthorized (NonAuthorizadException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,e.getMessage()),HttpStatus.FORBIDDEN);
    }


}
