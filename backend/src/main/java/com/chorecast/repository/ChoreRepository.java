package com.chorecast.repository;

import com.chorecast.model.Chore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChoreRepository extends JpaRepository<Chore, UUID> {
    List<Chore> findByHouseholdId(UUID householdId);
    List<Chore> findByAssignedTo(UUID assignedTo);
    List<Chore> findByNextDueBeforeAndCompletedFalse(LocalDateTime date);
    List<Chore> findByHouseholdIdAndCompletedFalse(UUID householdId);
}
