package com.jobtracker.application.dto;

import com.jobtracker.application.ApplicationStatus;
import java.time.Instant;
import java.time.LocalDate;

/**
 * API representation of an application returned to clients.
 */
public record ApplicationResponse(
        Long id,
        String position,
        ApplicationStatus status,
        String sourceUrl,
        Integer salaryMin,
        Integer salaryMax,
        LocalDate appliedAt,
        LocalDate deadline,
        String techStack,
        Instant createdAt,
        Instant updatedAt
) {
}
