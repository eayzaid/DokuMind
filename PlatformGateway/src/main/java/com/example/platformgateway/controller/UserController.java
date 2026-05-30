package com.example.platformgateway.controller;

import com.example.platformgateway.model.dto.CreateUserRequestDTO;
import com.example.platformgateway.model.dto.CreateUserResponseDTO;
import com.example.platformgateway.model.dto.FetchUserResponseDTO;
import com.example.platformgateway.model.dto.UserSummaryResponseDTO;
import com.example.platformgateway.model.enums.Role;
import com.example.platformgateway.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

  @GetMapping("/{userId}")
  public ResponseEntity<FetchUserResponseDTO> getUser(@PathVariable String userId){
    return ResponseEntity.ok(userService.getUser(java.util.UUID.fromString(userId)));
  }

  @PostMapping
  public ResponseEntity<CreateUserResponseDTO> createUser(@RequestBody CreateUserRequestDTO createUserRequestDTO){
    return ResponseEntity.status(201).body(userService.createUser(createUserRequestDTO));
  }

}
