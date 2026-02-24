\restrict dbmate

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: uuid_v7(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.uuid_v7() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cards (
    id uuid DEFAULT public.uuid_v7() NOT NULL,
    deck_id uuid NOT NULL,
    interval_strength real,
    next_repetition_time timestamp with time zone,
    definition character varying(255) NOT NULL,
    explanation character varying(255),
    primary_word character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decks (
    id uuid DEFAULT public.uuid_v7() NOT NULL,
    group_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    is_mode_normal boolean DEFAULT true NOT NULL,
    is_mode_reversed boolean DEFAULT false NOT NULL,
    is_mode_typing boolean DEFAULT false NOT NULL,
    is_randomized_order boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id uuid DEFAULT public.uuid_v7() NOT NULL,
    local_user_id uuid NOT NULL,
    name character varying(128) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: local_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.local_users (
    id uuid DEFAULT public.uuid_v7() NOT NULL,
    username character varying(60) NOT NULL,
    email character varying(320) NOT NULL,
    password character varying(1000) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_v7() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: users_progression_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_progression_history (
    id uuid DEFAULT public.uuid_v7() NOT NULL,
    group_id uuid NOT NULL,
    high_indication_count integer,
    mid_indication_count integer,
    low_indication_count integer,
    very_low_indication_count integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: decks decks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks
    ADD CONSTRAINT decks_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: local_users local_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_email_key UNIQUE (email);


--
-- Name: local_users local_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: users_progression_history users_progression_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_progression_history
    ADD CONSTRAINT users_progression_history_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_token_hash_idx ON public.refresh_tokens USING btree (token_hash);


--
-- Name: cards trg_card_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_card_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: decks trg_card_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_card_updated_at BEFORE UPDATE ON public.decks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: groups trg_card_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_card_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: local_users trg_card_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_card_updated_at BEFORE UPDATE ON public.local_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: cards card_deck_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT card_deck_fk FOREIGN KEY (deck_id) REFERENCES public.decks(id) ON DELETE CASCADE;


--
-- Name: decks deck_group_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks
    ADD CONSTRAINT deck_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: groups groups_local_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_local_user_fk FOREIGN KEY (local_user_id) REFERENCES public.local_users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES public.local_users(id) ON DELETE CASCADE;


--
-- Name: users_progression_history user_progression_history_group_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_progression_history
    ADD CONSTRAINT user_progression_history_group_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260201025145'),
    ('20260201025247'),
    ('20260201025335'),
    ('20260217010641');
