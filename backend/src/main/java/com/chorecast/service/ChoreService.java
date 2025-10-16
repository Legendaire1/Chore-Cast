package com.chorecast.service;

import com.chorecast.dto.ChoreRequest;
import com.chorecast.dto.ChoreResponse;
import com.chorecast.model.Chore;
import com.chorecast.repository.ChoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChoreService {
    private final ChoreRepository choreRepository;

    public ChoreResponse createChore(ChoreRequest request, UUID householdId) {
        LocalDateTime now = LocalDateTime.now();
        int daysToAdd = switch (request.getFrequency()) {
            case DAILY -> 1;
            case WEEKLY -> 7;
            case MONTHLY -> 30;
            default -> 7;
        };
        
        Chore chore = Chore.builder()
                .name(request.getName())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .assignedTo(request.getAssignedTo())
                .lastDone(now)
                .nextDue(now.plusDays(daysToAdd))
                .completed(false)
                .householdId(householdId)
                .build();
        
        chore = choreRepository.save(chore);
        return mapToResponse(chore);
    }

    public List<ChoreResponse> getHouseholdChores(UUID householdId) {
        return choreRepository.findByHouseholdId(householdId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ChoreResponse completeChore(UUID choreId) {
        Chore chore = choreRepository.findById(choreId)
                .orElseThrow(() -> new RuntimeException("Chore not found"));
        
        LocalDateTime now = LocalDateTime.now();
        int daysToAdd = switch (chore.getFrequency()) {
            case DAILY -> 1;
            case WEEKLY -> 7;
            case MONTHLY -> 30;
            default -> 7;
        };
        
        chore.setCompleted(true);
        chore.setLastDone(now);
        chore.setNextDue(now.plusDays(daysToAdd));
        
        chore = choreRepository.save(chore);
        return mapToResponse(chore);
    }

    private ChoreResponse mapToResponse(Chore chore) {
        ChoreResponse response = new ChoreResponse();
        response.setId(chore.getId());
        response.setName(chore.getName());
        response.setDescription(chore.getDescription());
        response.setFrequency(chore.getFrequency());
        response.setLastDone(chore.getLastDone());
        response.setAssignedTo(chore.getAssignedTo());
        response.setNextDue(chore.getNextDue());
        response.setCompleted(chore.getCompleted());
        return response;
    }
}
