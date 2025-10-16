package com.chorecast.dto;

import com.chorecast.model.Chore;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ChoreResponse {
    private UUID id;
    private String name;
    private String description;
    private Chore.Frequency frequency;
    private LocalDateTime lastDone;
    private UUID assignedTo;
    private LocalDateTime nextDue;
    private Boolean completed;
}
