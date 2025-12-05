--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-create runOnChange:false endDelimiter:--
-- validCheckSum: 9:90adb1415f835d78a8d9d8ece3b8cf4e
CREATE TABLE IF NOT EXISTS service_providing_group (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
    ) STORED,
    bidding_zone text NOT NULL,
    status text NOT NULL DEFAULT 'new' CHECK (
        status IN (
            'new',
            'active',
            'inactive',
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
    CONSTRAINT check_service_providing_group_bidding_zone CHECK (
        bidding_zone IN ('NO1', 'NO2', 'NO3', 'NO4', 'NO5')
    ),
    CONSTRAINT check_service_providing_group_name_length CHECK (
        (char_length(name) <= 128)
    )
);

-- changeset flex:service-providing-group-status-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_status_insert
BEFORE INSERT ON service_providing_group
FOR EACH ROW
EXECUTE FUNCTION status.restrict_insert('new');

-- changeset flex:service-providing-group-status-update-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_status_update
BEFORE UPDATE OF status ON service_providing_group
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status.restrict_update('new');

-- adds a SPG-GP resource for each ISO present in a SPG, now or in the future
-- changeset flex:service-providing-group-add-grid-prequalifications-for-future-impacted-system-operators runOnChange:true endDelimiter:--
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
        SELECT DISTINCT ap_so.system_operator_id
        FROM flex.service_providing_group_membership AS spgm
            INNER JOIN flex.controllable_unit cu
                ON spgm.controllable_unit_id = cu.id
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON ap_so.accounting_point_id = cu.accounting_point_id
                    AND ap_so.valid_time_range @> current_timestamp
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


-- changeset flex:service-providing-group-activation-function runOnChange:true endDelimiter:--
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

-- changeset flex:service-providing-group-activation-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_activation
AFTER UPDATE OF status ON service_providing_group
FOR EACH ROW
-- as status cannot go back to new, this trigger may be executed only once
WHEN (OLD.status = 'new' AND NEW.status = 'active') -- noqa
EXECUTE FUNCTION
service_providing_group_activation();

-- changeset flex:service-providing-group-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_event
AFTER INSERT OR UPDATE ON service_providing_group
FOR EACH ROW
EXECUTE FUNCTION capture_event();

-- changeset flex:service-providing-group-activation-not-empty-function runOnChange:true endDelimiter:--
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

-- changeset flex:service-providing-group-activation-not-empty-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_activation_not_empty
BEFORE UPDATE OF status ON service_providing_group
FOR EACH ROW
WHEN (OLD.status != 'active' AND NEW.status = 'active') -- noqa
EXECUTE FUNCTION service_providing_group_activation_not_empty();
