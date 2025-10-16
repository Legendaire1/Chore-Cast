package com.chorecast.repository;

import com.chorecast.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    List<Reminder> findByDueDateBeforeAndSentFalse(LocalDateTime date);
    List<Reminder> findByUserId(UUID userId);
}
