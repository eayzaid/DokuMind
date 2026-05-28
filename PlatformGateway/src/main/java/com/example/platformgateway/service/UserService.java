package com.example.platformgateway.service;

import com.example.platformgateway.model.dto.UserSummaryDTO;
import com.example.platformgateway.model.dto.UserSummaryResponseDTO;
import com.example.platformgateway.model.entity.User;
import com.example.platformgateway.model.enums.Role;
import com.example.platformgateway.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

  private final UserRepository userRepository;

  public UserService(UserRepository userRepository){
    this.userRepository = userRepository;
  }

  public UserSummaryResponseDTO getAllUsers(int page, String firstName, String lastName, Role role){
    int sizeOfPage = 10;
    Pageable pageRequested = PageRequest.of(page, sizeOfPage);
    Page<User> userPage = userRepository.findAll(pageRequested);
    List<UserSummaryDTO> users =  userPage.stream()
            .filter(user -> firstName == null || user.getFirstName().toLowerCase().contains(firstName.toLowerCase()))
            .filter(user -> lastName == null || user.getLastName().toLowerCase().contains(lastName.toLowerCase()))
            .filter(user -> role == null || user.getRole().name().equals(role.name()))
            .map(user -> new UserSummaryDTO(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole()
            )).toList();
    return new UserSummaryResponseDTO( userPage.getTotalElements() , userPage.getTotalPages() , users );
  }
}
