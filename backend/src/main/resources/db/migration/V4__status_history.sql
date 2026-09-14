-- V4: append-only audit trail of status transitions.
-- Powers the card timeline (Phase 5) and "average time in status" (Phase 9).

CREATE TABLE status_history (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT      NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
    from_status    TEXT,
    to_status      TEXT        NOT NULL,
    changed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_status_history_application ON status_history (application_id, changed_at);

-- Applications that predate this table get their opening entry, so every
-- timeline starts at creation rather than at the first move after deploy.
INSERT INTO status_history (application_id, from_status, to_status, changed_at)
SELECT id, NULL, status, created_at
FROM applications;
