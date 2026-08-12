package com.jobtracker.application;

/**
 * Lifecycle of a job application. Stored as text in the database
 * ({@code @Enumerated(EnumType.STRING)}) so reordering never corrupts data.
 */
public enum ApplicationStatus {
    SAVED,
    APPLIED,
    SCREENING,
    INTERVIEW,
    OFFER,
    REJECTED
}
