-- V2: authentication — user roles, unique email, and application ownership.

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';

CREATE UNIQUE INDEX ux_users_email ON users (email);

-- Ownership: every application belongs to exactly one user.
ALTER TABLE applications
    ADD COLUMN user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX ix_applications_user_id ON applications (user_id);
CREATE INDEX ix_applications_user_status ON applications (user_id, status);
