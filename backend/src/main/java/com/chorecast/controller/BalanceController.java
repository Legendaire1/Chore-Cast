package com.chorecast.controller;

import com.chorecast.model.Balance;
import com.chorecast.model.User;
import com.chorecast.repository.UserRepository;
import com.chorecast.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
@CrossOrigin
public class BalanceController {
    
    private final BalanceService balanceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Balance>> getBalances(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(balanceService.getHouseholdBalances(user.getHouseholdId()));
    }

    @GetMapping("/my-debts")
    public ResponseEntity<List<Balance>> getMyDebts(Authentication auth) {
        User user = getUserFromAuth(auth);
        return ResponseEntity.ok(balanceService.getUserDebts(user.getId()));
    }

    private User getUserFromAuth(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
