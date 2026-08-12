package com.jobtracker.common.error;

/**
 * Thrown when a request conflicts with existing state (e.g. duplicate email).
 * Mapped to HTTP 409 by {@link GlobalExceptionHandler}.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
