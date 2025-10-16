package com.chorecast.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private UserDTO user;
}
