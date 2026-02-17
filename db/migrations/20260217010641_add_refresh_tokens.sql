-- migrate:up

CREATE TABLE refresh_tokens
(
    id         UUID PRIMARY KEY DEFAULT uuid_v7(),
    user_id    UUID        NOT NULL,
    token_hash CHAR(64)    NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE IF EXISTS refresh_tokens
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES local_users ON DELETE CASCADE;

CREATE INDEX refresh_tokens_token_hash_idx
    ON refresh_tokens (token_hash);

-- migrate:down

