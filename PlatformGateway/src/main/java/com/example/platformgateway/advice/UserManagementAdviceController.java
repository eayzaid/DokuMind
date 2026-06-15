package com.example.platformgateway.advice;

import com.example.platformgateway.controller.UserController;
import com.example.platformgateway.exception.RuntimeMessagingException;
import com.example.platformgateway.exception.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = { UserController.class })
public class UserManagementAdviceController {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ProblemDetail> userNotFound (UserNotFoundException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,e.getMessage()),HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RuntimeMessagingException.class)
    public ResponseEntity<ProblemDetail> messagingException (RuntimeMessagingException e){
        return new ResponseEntity<>( ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE,e.getMessage()),HttpStatus.SERVICE_UNAVAILABLE);
    }

}
