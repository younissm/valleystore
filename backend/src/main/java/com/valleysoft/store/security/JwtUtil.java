package com.valleysoft.store.security;

import com.valleysoft.store.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {

    public static final long ACCESS_TOKEN_VALIDITY_SECONDS = 5 * 60;

    private final JwtParser jwtParser;

    private static final String JWT_HEADER = "Authorization";
    private static final String JWT_PREFIX = "Bearer ";
    private final SecretKey secretKey;

    public JwtUtil(@Value("${jwt.secret}") String secretString) {
        this.secretKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
        this.jwtParser = Jwts.parser().verifyWith(secretKey).build();
    }

    public String createToken(Authentication authentication) {
        if (authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authentication must have a non-blank username");
        }

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(JwtUtil::toRoleName)
                .toList();
        if (roles.size() != 1) {
            throw new IllegalArgumentException("Authentication must have exactly one role");
        }

        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime()
                + TimeUnit.SECONDS.toMillis(ACCESS_TOKEN_VALIDITY_SECONDS));

        return Jwts.builder()
                .subject(authentication.getName())
                .claim("role", roles.get(0))
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(JWT_HEADER);
        if (bearerToken != null && bearerToken.startsWith(JWT_PREFIX)) {
            return bearerToken.substring(JWT_PREFIX.length());
        }
        return null;
    }

    public Claims parseJwtClaims(String token) {
        return jwtParser.parseSignedClaims(token).getPayload();
    }

    public Claims resolveClaims(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null || token.isEmpty()) {
            return null;
        }

        try {
            return parseJwtClaims(token);
        } catch (MalformedJwtException e) {
            throw new MalformedJwtException("Invalid JWT format: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            throw new UnsupportedJwtException("Unsupported JWT: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), null, "JWT has expired");
        } catch (SignatureException e) {
            throw new SignatureException("JWT signature validation failed: " + e.getMessage());
        } catch (Exception e) {
            throw new JwtException("JWT parsing error: " + e.getMessage());
        }
    }

    public boolean validateClaims(Claims claims) {
        if (claims == null || claims.getExpiration() == null) {
            return false;
        }
        return claims.getExpiration().after(new Date());
    }

    public String getEmail(Claims claims) {
        if (claims == null) {
            return null;
        }
        return claims.getSubject();
    }

    public Collection<GrantedAuthority> getAuthorities(Claims claims) {
        if (claims == null) {
            return null;
        }

        String role = claims.get("role", String.class);
        if (role == null || role.isBlank()) {
            throw new JwtException("JWT must contain exactly one role claim");
        }

        try {
            String roleName = Role.valueOf(role).name();
            return List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
        } catch (IllegalArgumentException e) {
            throw new JwtException("Unknown role in JWT: " + role);
        }
    }

    private static String toRoleName(String authority) {
        if (authority == null || authority.isBlank()) {
            throw new IllegalArgumentException("Role authority must not be blank");
        }
        String roleName = authority.startsWith("ROLE_")
                ? authority.substring("ROLE_".length())
                : authority;
        try {
            return Role.valueOf(roleName).name();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown role: " + authority, e);
        }
    }
}