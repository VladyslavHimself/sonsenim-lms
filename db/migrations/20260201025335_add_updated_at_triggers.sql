-- migrate:up
CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_card_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_card_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_card_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_card_updated_at
    BEFORE UPDATE ON local_users
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- migrate:down

