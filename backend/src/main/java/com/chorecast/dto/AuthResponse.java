package com.chorecast.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
}

@Data
public class AuthResponse {
    private String token;
    private UserDTO user;
}
