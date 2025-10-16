package com.chorecast.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ExpenseResponse {
    private UUID id;
    private String description;
    private BigDecimal amount;
    private UUID payerId;
    private List<UUID> participants;
    private LocalDateTime createdAt;
    private Boolean settled;
}
