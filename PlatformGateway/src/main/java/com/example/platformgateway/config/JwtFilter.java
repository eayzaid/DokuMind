package com.example.platformgateway.config;

import com.example.platformgateway.model.dto.common.JwtPayloadDTO;
import com.example.platformgateway.provider.JwtProvider;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class JwtFilter extends OncePerRequestFilter{

  private final JwtProvider jwtProvider;

  public JwtFilter(JwtProvider jwtProvider){
    this.jwtProvider = jwtProvider;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws java.io.IOException, ServletException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getParameter("token") != null) {
            token = request.getParameter("token");
        }

        if (token != null) {
          try {
              JwtPayloadDTO payload = jwtProvider.decodeToken(token);
              UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                      payload,
                      null,
                      java.util.Collections.emptyList() // No authorities for simplicity
              );
              SecurityContextHolder.getContext().setAuthentication(authentication);
          } catch (Exception e) {
              // Token invalid or expired, ignore to let security config handle it
          }
        }
        filterChain.doFilter(request, response);
    }
}
