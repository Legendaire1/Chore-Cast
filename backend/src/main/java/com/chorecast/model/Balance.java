package com.chorecast.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "balances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Balance {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_from", nullable = false)
    private UUID userFrom;
    
    @Column(name = "user_to", nullable = false)
    private UUID userTo;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "household_id", nullable = false)
    private UUID householdId;
}
