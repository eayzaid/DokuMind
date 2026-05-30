package com.example.platformgateway.service;

import com.example.platformgateway.exception.BadRequestException;
import com.example.platformgateway.exception.NonAuthenticatedAccessException;
import com.example.platformgateway.exception.RuntimeMessagingException;
import com.example.platformgateway.model.dto.*;
import com.example.platformgateway.model.entity.User;
import com.example.platformgateway.model.enums.Role;
import com.example.platformgateway.repository.CompanyRepository;
import com.example.platformgateway.repository.UserRepository;
import com.example.platformgateway.utils.BcryptUtility;
import jakarta.mail.MessagingException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final CompanyRepository companyRepository;
  private final EmailService emailService;

  public UserService(UserRepository userRepository, CompanyRepository companyRepository , EmailService emailService){
    this.userRepository = userRepository;
    this.companyRepository = companyRepository;
    this.emailService = emailService;
  }

  public UserSummaryResponseDTO getAllUsers(int page, String firstName, String lastName, Role role){
    int sizeOfPage = 10;
    Pageable pageRequested = PageRequest.of(page, sizeOfPage);
    JwtPayloadDTO authContext = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .map(Authentication::getPrincipal)
            .filter(JwtPayloadDTO.class::isInstance)
            .map(JwtPayloadDTO.class::cast)
            .orElseThrow(() -> new NonAuthenticatedAccessException("Access Denied , Non Authenticated"));
    Page<User> userPage = userRepository.findFiltered(firstName, lastName, role , authContext.companyId(), pageRequested);
    List<UserSummaryDTO> users = userPage.stream()
            .map(user -> new UserSummaryDTO(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole()
            )).toList();
    return new UserSummaryResponseDTO( userPage.getTotalElements() , userPage.getTotalPages() , users );
  }

  @Transactional
  public CreateUserResponseDTO createUser(CreateUserRequestDTO createUserRequestDTO) throws RuntimeMessagingException {
    String userPassword = BcryptUtility.generateRandomPassword();
    JwtPayloadDTO authContext = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
            .map(Authentication::getPrincipal)
            .filter(JwtPayloadDTO.class::isInstance)
            .map(JwtPayloadDTO.class::cast)
            .orElseThrow(() -> new NonAuthenticatedAccessException("Access Denied , Non Authenticated"));

    if(createUserRequestDTO.role().equals(Role.SUPER_RH)) throw new BadRequestException("Cannot create a user with SUPER_RH role");
    User newUser = User.builder()
            .firstName(createUserRequestDTO.firstName())
            .lastName(createUserRequestDTO.lastName())
            .email(createUserRequestDTO.email())
            .role(createUserRequestDTO.role())
            .password(BcryptUtility.hashPassword(userPassword))
            .company(companyRepository.findById(authContext.companyId()).orElseThrow(() -> new BadRequestException("Company not found")))
            .build();
    User savedUser = userRepository.save(newUser);
    try{
      emailService.sendEmail(emailService.buildEmailDetails(savedUser.getEmail(), userPassword, true));
    }catch(MessagingException e){
      throw new RuntimeMessagingException("Failed to send email to the new user");
    }
    return new CreateUserResponseDTO(savedUser.getId());
  }
}
