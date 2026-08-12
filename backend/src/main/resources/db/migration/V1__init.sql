-- V1: initial schema — users and applications.
-- Ownership (user_id) and the role column are added in V2 (Phase 2).

CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE applications (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    position   TEXT        NOT NULL,
    status     TEXT        NOT NULL DEFAULT 'SAVED',
    source_url TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    applied_at DATE,
    deadline   DATE,
    tech_stack TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
