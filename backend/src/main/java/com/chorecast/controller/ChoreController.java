package com.chorecast.controller;

import com.chorecast.dto.ChoreRequest;
import com.chorecast.dto.ChoreResponse;
import com.chorecast.model.User;
import com.chorecast.repository.UserRepository;
import com.chorecast.service.ChoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chores")
@RequiredArgsConstructor
@CrossOrigin
public class ChoreController {
    
    private final ChoreService choreService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ChoreResponse> createChore(@RequestBody ChoreRequest request, Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(choreService.createChore(request, user.getHouseholdId()));
    }

    @GetMapping
    public ResponseEntity<List<ChoreResponse>> getChores(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(choreService.getHouseholdChores(user.getHouseholdId()));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ChoreResponse> completeChore(@PathVariable UUID id) {
        return ResponseEntity.ok(choreService.completeChore(id));
    }

    private User getUserFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
