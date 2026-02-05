-- migrate:up
CREATE TABLE cards
(
    id                   UUID         NOT NULL DEFAULT uuid_v7(),
    deck_id              UUID         NOT NULL,

    interval_strength    FLOAT4,
    next_repetition_time TIMESTAMPTZ,
    definition           VARCHAR(255) NOT NULL,
    explanation          VARCHAR(255),
    primary_word         VARCHAR(255) NOT NULL,

    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),

    PRIMARY KEY (id)
);

CREATE TABLE decks
(
    id                  UUID         NOT NULL DEFAULT uuid_v7(),
    group_id            UUID         NOT NULL,

    name                VARCHAR(255) NOT NULL,
    is_mode_normal      BOOLEAN      NOT NULL DEFAULT TRUE,
    is_mode_reversed    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_mode_typing      BOOLEAN      NOT NULL DEFAULT FALSE,

    is_randomized_order BOOLEAN      NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

    PRIMARY KEY (id)
);

CREATE TABLE groups
(

    id            UUID         NOT NULL DEFAULT uuid_v7(),
    local_user_id UUID         NOT NULL,

    name          VARCHAR(128) NOT NULL,

    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    PRIMARY KEY (id)
);

CREATE TABLE local_users
(
    id         UUID          NOT NULL DEFAULT uuid_v7(),

    username   VARCHAR(60)   NOT NULL,
    email      VARCHAR(320)  NOT NULL UNIQUE,
    password   VARCHAR(1000) NOT NULL,
    first_name VARCHAR(255)  NOT NULL,
    last_name  VARCHAR(255)  NOT NULL,

    created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),

    PRIMARY KEY (id)
);

CREATE TABLE users_progression_history
(

    id                        UUID        NOT NULL DEFAULT uuid_v7(),
    group_id                  UUID        NOT NULL,

    high_indication_count     INTEGER,
    mid_indication_count      INTEGER,
    low_indication_count      INTEGER,
    very_low_indication_count INTEGER,

    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS cards
    ADD CONSTRAINT card_deck_fk FOREIGN KEY (deck_id) REFERENCES decks ON
DELETE
CASCADE;

ALTER TABLE IF EXISTS decks
    ADD CONSTRAINT deck_group_fk FOREIGN KEY (group_id) REFERENCES groups ON
DELETE
CASCADE;

ALTER TABLE IF EXISTS groups
    ADD CONSTRAINT groups_local_user_fk FOREIGN KEY (local_user_id) REFERENCES local_users ON
DELETE
CASCADE;

ALTER TABLE IF EXISTS users_progression_history
    ADD CONSTRAINT user_progression_history_group_id_fk FOREIGN KEY (group_id) REFERENCES groups ON
DELETE
CASCADE;

-- migrate:down

