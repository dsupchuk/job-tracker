package com.jobtracker.application.dto;

import com.jobtracker.application.ApplicationStatus;
import java.time.Instant;

/** One entry in an application's status timeline. */
public record StatusHistoryResponse(
        Long id,
        ApplicationStatus fromStatus,
        ApplicationStatus toStatus,
        Instant changedAt
) {
}
