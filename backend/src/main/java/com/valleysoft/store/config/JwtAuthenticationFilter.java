package com.valleysoft.store.config;

import com.valleysoft.store.security.JwtUtil;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = getJwtFromRequest(request);

        if (jwt == null || jwt.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtUtil.resolveClaims(request);

            if (claims == null) {
                throw new MalformedJwtException("Invalid JWT claims");
            }

            String role = claims.get("role", String.class);

            if (role == null || role.isBlank()) {
                throw new UnsupportedJwtException(
                        "JWT must contain role claim");
            }

            Set<GrantedAuthority> authorities = new HashSet<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            claims.getSubject(),
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired JWT"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }



    private String getJwtFromRequest(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
}