package com.chorecast.repository;

import com.chorecast.model.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BalanceRepository extends JpaRepository<Balance, UUID> {
    List<Balance> findByHouseholdId(UUID householdId);
    Optional<Balance> findByUserFromAndUserTo(UUID userFrom, UUID userTo);
    List<Balance> findByUserFrom(UUID userFrom);
    List<Balance> findByUserTo(UUID userTo);
}
