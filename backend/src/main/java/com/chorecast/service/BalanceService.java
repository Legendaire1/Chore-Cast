package com.chorecast.service;

import com.chorecast.model.Balance;
import com.chorecast.repository.BalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BalanceService {
    private final BalanceRepository balanceRepository;

    public List<Balance> getHouseholdBalances(UUID householdId) {
        return balanceRepository.findByHouseholdId(householdId);
    }

    public List<Balance> getUserDebts(UUID userId) {
        return balanceRepository.findByUserFrom(userId);
    }

    public List<Balance> getUserCredits(UUID userId) {
        return balanceRepository.findByUserTo(userId);
    }
}
