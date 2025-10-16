package com.chorecast.service;

import com.chorecast.dto.ExpenseRequest;
import com.chorecast.dto.ExpenseResponse;
import com.chorecast.model.Balance;
import com.chorecast.model.Expense;
import com.chorecast.repository.BalanceRepository;
import com.chorecast.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final BalanceRepository balanceRepository;

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request, UUID householdId) {
        Expense expense = Expense.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .payerId(request.getPayerId())
                .participants(request.getParticipants())
                .settled(false)
                .householdId(householdId)
                .build();
        
        expense = expenseRepository.save(expense);
        
        // Calculate and update balances
        updateBalances(expense);
        
        return mapToResponse(expense);
    }

    public List<ExpenseResponse> getHouseholdExpenses(UUID householdId) {
        return expenseRepository.findByHouseholdId(householdId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void settleExpense(UUID expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        expense.setSettled(true);
        expenseRepository.save(expense);
        
        // Clear related balances
        clearBalances(expense);
    }

    private void updateBalances(Expense expense) {
        BigDecimal splitAmount = expense.getAmount()
                .divide(BigDecimal.valueOf(expense.getParticipants().size()), 2, RoundingMode.HALF_UP);
        
        for (UUID participantId : expense.getParticipants()) {
            if (!participantId.equals(expense.getPayerId())) {
                Balance balance = balanceRepository.findByUserFromAndUserTo(participantId, expense.getPayerId())
                        .orElse(Balance.builder()
                                .userFrom(participantId)
                                .userTo(expense.getPayerId())
                                .amount(BigDecimal.ZERO)
                                .householdId(expense.getHouseholdId())
                                .build());
                
                balance.setAmount(balance.getAmount().add(splitAmount));
                balanceRepository.save(balance);
            }
        }
    }

    private void clearBalances(Expense expense) {
        BigDecimal splitAmount = expense.getAmount()
                .divide(BigDecimal.valueOf(expense.getParticipants().size()), 2, RoundingMode.HALF_UP);
        
        for (UUID participantId : expense.getParticipants()) {
            if (!participantId.equals(expense.getPayerId())) {
                balanceRepository.findByUserFromAndUserTo(participantId, expense.getPayerId())
                        .ifPresent(balance -> {
                            balance.setAmount(balance.getAmount().subtract(splitAmount));
                            if (balance.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                                balanceRepository.delete(balance);
                            } else {
                                balanceRepository.save(balance);
                            }
                        });
            }
        }
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setDescription(expense.getDescription());
        response.setAmount(expense.getAmount());
        response.setPayerId(expense.getPayerId());
        response.setParticipants(expense.getParticipants());
        response.setCreatedAt(expense.getCreatedAt());
        response.setSettled(expense.getSettled());
        return response;
    }
}
