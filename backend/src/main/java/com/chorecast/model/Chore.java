package com.chorecast.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chore {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;
    
    @Column(name = "last_done")
    private LocalDateTime lastDone;
    
    @Column(name = "assigned_to", nullable = false)
    private UUID assignedTo;
    
    @Column(name = "next_due", nullable = false)
    private LocalDateTime nextDue;
    
    @Column(nullable = false)
    private Boolean completed = false;
    
    @Column(name = "household_id", nullable = false)
    private UUID householdId;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum Frequency {
        DAILY, WEEKLY, MONTHLY, CUSTOM
    }
}
