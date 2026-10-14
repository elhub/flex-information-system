--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-entity-client-remove-client-secret runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'api' AND table_name = 'entity_client' AND column_name = 'client_secret'
-- CREATE OR REPLACE VIEW cannot remove a column, so the view is dropped and recreated.
DROP FUNCTION IF EXISTS api.entity(api.entity_client);
DROP FUNCTION IF EXISTS api.client(api.entity);
DROP FUNCTION IF EXISTS api.party(api.entity_client);
DROP VIEW IF EXISTS api.entity_client;

CREATE VIEW api.entity_client
WITH (security_invoker = true) AS (
    SELECT
        id,
        entity_id,
        client_id,
        name,
        party_id,
        scopes,
        public_key,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.entity_client
);

CREATE TRIGGER entity_client_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON api.entity_client
FOR EACH ROW
EXECUTE FUNCTION api.entity_client_modify();

CREATE FUNCTION api.entity(api.entity_client)
RETURNS SETOF api.entity ROWS 1 AS $$
  select * from api.entity where id = $1.entity_id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION api.entity(api.entity_client)
TO flex_common, flex_entity;

CREATE FUNCTION api.client(api.entity)
RETURNS SETOF api.entity_client AS $$
  select * from api.entity_client where entity_id = $1.id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION api.client(api.entity)
TO flex_common, flex_entity;

CREATE FUNCTION api.party(api.entity_client)
RETURNS SETOF api.party ROWS 1 AS $$
  select * from api.party where id = $1.party_id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION api.party(api.entity_client)
TO flex_common, flex_entity;

-- changeset flex:api-entity-client-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW api.entity_client
WITH (security_invoker = true) AS (
    SELECT
        id,
        entity_id,
        client_id,
        name,
        party_id,
        scopes,
        public_key,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.entity_client
);

-- changeset flex:api-entity-client-modify-function endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION api.entity_client_modify()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_id bigint;
    l_new record;
BEGIN
    IF TG_OP = 'INSERT' THEN

        INSERT INTO flex.entity_client (
            entity_id,
            name,
            party_id,
            scopes,
            public_key
        )
        VALUES (
            NEW.entity_id,
            NEW.name,
            NEW.party_id,
            NEW.scopes,
            NEW.public_key
        )
        RETURNING id INTO l_id;

        SELECT * INTO l_new FROM api.entity_client WHERE id = l_id;
        RETURN l_new;

    ELSIF TG_OP = 'UPDATE' THEN

        UPDATE flex.entity_client SET
            client_id = NEW.client_id,
            name = NEW.name,
            party_id = NEW.party_id,
            scopes = NEW.scopes,
            public_key = NEW.public_key
        WHERE id = NEW.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
            RETURN null;
        END IF;

        SELECT * INTO l_new FROM api.entity_client WHERE id = NEW.id;
        RETURN l_new;

    ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.entity_client WHERE id = OLD.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
        END IF;

        RETURN OLD;

    END IF;

    RETURN null;
END;
$$;

-- changeset flex:api-entity-client-modify-trigger endDelimiter:-- runOnChange:true
CREATE OR REPLACE TRIGGER entity_client_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON api.entity_client
FOR EACH ROW
EXECUTE FUNCTION api.entity_client_modify();
