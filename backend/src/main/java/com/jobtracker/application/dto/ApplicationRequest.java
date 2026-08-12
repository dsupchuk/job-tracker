package com.jobtracker.application.dto;

import com.jobtracker.application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Payload for creating or updating an application. Entities never cross the API
 * boundary — this record does. {@code status} is optional and defaults to
 * {@code SAVED} when omitted.
 */
public record ApplicationRequest(
        @NotBlank @Size(max = 255) String position,
        ApplicationStatus status,
        @Size(max = 2048) String sourceUrl,
        @PositiveOrZero Integer salaryMin,
        @PositiveOrZero Integer salaryMax,
        @PastOrPresent LocalDate appliedAt,
        LocalDate deadline,
        @Size(max = 1024) String techStack
) {
}
