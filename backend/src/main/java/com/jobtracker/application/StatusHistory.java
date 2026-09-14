package com.jobtracker.application;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/**
 * One status transition. Append-only: rows are never updated or deleted except
 * by cascade when the owning application is removed.
 */
@Entity
@Table(name = "status_history")
@Getter
@Setter
@NoArgsConstructor
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long applicationId;

    /** Null for the opening entry written when the application is created. */
    @Enumerated(EnumType.STRING)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus toStatus;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant changedAt;

    static StatusHistory of(Long applicationId, ApplicationStatus from, ApplicationStatus to) {
        StatusHistory entry = new StatusHistory();
        entry.setApplicationId(applicationId);
        entry.setFromStatus(from);
        entry.setToStatus(to);
        return entry;
    }
}
