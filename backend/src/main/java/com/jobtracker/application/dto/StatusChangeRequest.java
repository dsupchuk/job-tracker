package com.jobtracker.application.dto;

import com.jobtracker.application.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

/** Payload for {@code PATCH /api/applications/{id}/status}. */
public record StatusChangeRequest(@NotNull ApplicationStatus status) {
}
