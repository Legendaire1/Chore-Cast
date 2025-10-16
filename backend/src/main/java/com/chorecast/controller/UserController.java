package com.chorecast.controller;

import com.chorecast.dto.UserDTO;
import com.chorecast.model.User;
import com.chorecast.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {
    
    private final UserRepository userRepository;

    @GetMapping("/household")
    public ResponseEntity<List<UserDTO>> getHouseholdMembers(Authentication auth) {
        User currentUser = getUserFromAuth(auth);
        
        List<UserDTO> householdMembers = userRepository.findByHouseholdId(currentUser.getHouseholdId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(householdMembers);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(convertToDTO(user));
    }

    private User getUserFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setHouseholdId(user.getHouseholdId());
        return dto;
    }
}
