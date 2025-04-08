CREATE TABLE IF NOT EXISTS service_providing_group (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
    ) STORED,
    status text NOT NULL DEFAULT 'new' CHECK (
        status IN (
            'new',
            'active',
            'terminated'
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_service_providing_group_service_provider_id FOREIGN KEY (
        service_provider_id, service_provider_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT check_service_providing_group_name_length CHECK (
        (char_length(name) <= 128)
    )
);

CREATE OR REPLACE TRIGGER service_providing_group_status_insert
BEFORE INSERT ON service_providing_group
FOR EACH ROW
EXECUTE FUNCTION status_insert('new');

CREATE OR REPLACE TRIGGER service_providing_group_status_update
BEFORE UPDATE OF status ON service_providing_group
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status_update('new');

-- adds a SPG-GP resource for each ISO present in a SPG, now or in the future
CREATE OR REPLACE FUNCTION
add_spg_grid_prequalifications_for_future_impacted_system_operators(
    l_service_providing_group_id bigint
)
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_impacted_system_operator_id bigint;
BEGIN
    -- ISO are currently the CSO of the CUs currently in the updated SPG
    -- TODO: update when a grid model is implemented

    FOR l_impacted_system_operator_id IN
        SELECT DISTINCT ap.system_operator_id
        FROM flex.service_providing_group_membership spgm
        INNER JOIN flex.controllable_unit cu
        ON spgm.controllable_unit_id = cu.id
        INNER JOIN flex.accounting_point ap
        ON ap.business_id = cu.accounting_point_id
        WHERE spgm.service_providing_group_id = l_service_providing_group_id
        -- CU still in the SPG in the future
        AND (
            upper(spgm.valid_time_range) IS NULL OR
            upper(spgm.valid_time_range) > current_timestamp
        )
    LOOP
        INSERT INTO flex.service_providing_group_grid_prequalification (
            service_providing_group_id,
            impacted_system_operator_id,
            recorded_by
        ) VALUES (
            l_service_providing_group_id,
            l_impacted_system_operator_id,
            0
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


CREATE OR REPLACE FUNCTION
service_providing_group_activation()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    PERFORM add_spg_grid_prequalifications_for_future_impacted_system_operators(
        NEW.id
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER service_providing_group_activation
AFTER UPDATE OF status ON service_providing_group
FOR EACH ROW
-- as status cannot go back to new, this trigger may be executed only once
WHEN (OLD.status = 'new' AND NEW.status = 'active') -- noqa
EXECUTE FUNCTION
service_providing_group_activation();

CREATE OR REPLACE TRIGGER service_providing_group_event
AFTER INSERT OR UPDATE ON service_providing_group
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group');

-- SPG-VAL001
CREATE OR REPLACE FUNCTION service_providing_group_activation_not_empty()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    system_operator_id bigint;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM flex.service_providing_group_membership spgm
        WHERE spgm.service_providing_group_id = NEW.id
        AND spgm.valid_time_range @> current_timestamp
    ) THEN
        RAISE sqlstate 'PT400' using
            message = 'empty service providing group cannot be activated';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER service_providing_group_activation_not_empty
BEFORE UPDATE OF status ON service_providing_group
FOR EACH ROW
WHEN (OLD.status != 'active' AND NEW.status = 'active') -- noqa
EXECUTE FUNCTION service_providing_group_activation_not_empty();
