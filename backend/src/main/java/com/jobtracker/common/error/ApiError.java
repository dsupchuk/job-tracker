package com.jobtracker.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Consistent error response body for every failed request.
 * {@code fieldErrors} is present only for validation failures.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        List<FieldValidationError> fieldErrors
) {

    public static ApiError of(int status, String code, String message) {
        return new ApiError(Instant.now(), status, code, message, null);
    }

    public static ApiError of(int status, String code, String message, List<FieldValidationError> fieldErrors) {
        return new ApiError(Instant.now(), status, code, message, fieldErrors);
    }

    /** A single field-level validation failure. */
    public record FieldValidationError(String field, String message) {
    }
}
