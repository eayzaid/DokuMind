package com.example.platformgateway.controller;

import com.example.platformgateway.model.dto.UserSummaryResponseDTO;
import com.example.platformgateway.model.enums.Role;
import com.example.platformgateway.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  public UserController( UserService userService){
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<UserSummaryResponseDTO> getAllUsers(
          @RequestParam(name = "page", defaultValue = "0") int page,
          @RequestParam(name = "first_name", required = false) String firstName,
          @RequestParam(name= "last_name" , required = false) String lastName,
          @RequestParam(name = "role", required = false) Role role
  ){
    return ResponseEntity.ok(userService.getAllUsers(page,firstName,lastName,role));
  }

}
