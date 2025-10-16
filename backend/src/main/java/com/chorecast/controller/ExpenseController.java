package com.chorecast.controller;

import com.chorecast.dto.ExpenseRequest;
import com.chorecast.dto.ExpenseResponse;
import com.chorecast.model.User;
import com.chorecast.repository.UserRepository;
import com.chorecast.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin
public class ExpenseController {
    
    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@RequestBody ExpenseRequest request, Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(expenseService.createExpense(request, user.getHouseholdId()));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(expenseService.getHouseholdExpenses(user.getHouseholdId()));
    }

    @PutMapping("/{id}/settle")
    public ResponseEntity<Void> settleExpense(@PathVariable UUID id) {
        expenseService.settleExpense(id);
        return ResponseEntity.ok().build();
    }

    private User getUserFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
