-- migrate:up
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION uuid_v7()
    RETURNS UUID
    LANGUAGE plpgsql
AS
$$
DECLARE
ts_ms      BIGINT;
    rand_bytes BYTEA;
    uuid_bytes BYTEA;
BEGIN
    -- timestamp in milliseconds
    ts_ms := (extract(epoch FROM clock_timestamp()) * 1000)::BIGINT;

    -- 10 random bytes
    rand_bytes := gen_random_bytes(10);

    -- build UUID bytes
    uuid_bytes :=
            set_byte(
                    set_byte(
                            set_byte(
                                    set_byte(
                                            substring(int8send(ts_ms) FROM 3) || rand_bytes,
                                            6, (get_byte(rand_bytes, 6) & 15) | 112 -- version 7
                                    ),
                                    8, (get_byte(rand_bytes, 8) & 63) | 128 -- variant RFC 4122
                            ),
                            0, get_byte(int8send(ts_ms), 2)
                    ),
                    1, get_byte(int8send(ts_ms), 3)
            );

RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$;

-- migrate:down

