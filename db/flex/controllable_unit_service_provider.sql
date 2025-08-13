--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-service-provider-create runOnChange:false endDelimiter:--
-- SP relation for controllable unit
--validCheckSum: 9:ce9768392d0c1975d766a5cf1dc11e36
CREATE TABLE IF NOT EXISTS controllable_unit_service_provider (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    controllable_unit_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
    ) STORED,
    end_user_id bigint NOT NULL,
    end_user_party_type text GENERATED ALWAYS AS (
        'end_user'
    ) STORED,
    contract_reference text NOT NULL CHECK (
        char_length(contract_reference) <= 128
    ),
    valid_time_range tstzrange CHECK (
        valid_time_range IS null OR (
            lower(valid_time_range) IS NOT null
            AND lower_inc(valid_time_range)
            AND NOT upper_inc(valid_time_range)
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT controllable_unit_service_provider_controllable_unit_fkey
    FOREIGN KEY (
        controllable_unit_id
    ) REFERENCES controllable_unit (id),
    CONSTRAINT controllable_unit_service_provider_service_provider_fkey
    FOREIGN KEY (
        service_provider_id, service_provider_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT controllable_unit_service_provider_end_user_fkey
    FOREIGN KEY (
        end_user_id, end_user_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT controllable_unit_service_provider_valid_time_overlap
    EXCLUDE USING gist (
        controllable_unit_id WITH =, valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

-- changeset flex:controllable-unit-service-provider-make-room-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_service_provider_make_room
BEFORE INSERT OR UPDATE
ON flex.controllable_unit_service_provider
FOR EACH ROW
EXECUTE PROCEDURE timeline.make_room(
    'controllable_unit_id'
);

-- changeset flex:controllable-unit-service-provider-soft-delete runAlways:true endDelimiter:--
-- rule because INSTEAD OF triggers on tables are not possible,
-- and we want all the trigger logic here, not in the api schema file
-- noqa: disable=all
CREATE OR REPLACE RULE controllable_unit_service_provider_soft_delete AS
ON DELETE TO controllable_unit_service_provider DO INSTEAD
    UPDATE controllable_unit_service_provider
    SET valid_time_range = null
    WHERE id = OLD.id
    RETURNING controllable_unit_service_provider.*;
-- noqa: enable=all

-- changeset flex:controllable-unit-service-provider-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_service_provider_event
AFTER INSERT OR UPDATE OR DELETE ON controllable_unit_service_provider
FOR EACH ROW
EXECUTE FUNCTION capture_event('controllable_unit_service_provider');

-- changeset flex:controllable-unit-service-provider-valid-time-freeze runOnChange:true endDelimiter:--
-- IFV: CUSP-VAL001
CREATE OR REPLACE TRIGGER controllable_unit_service_provider_valid_time_freeze
BEFORE UPDATE ON controllable_unit_service_provider
FOR EACH ROW
WHEN (current_role = 'flex_service_provider')
EXECUTE FUNCTION timeline.freeze('2 weeks');

-- changeset flex:controllable-unit-service-provider-timeline-midnight-aligned runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_timeline_midnight_aligned
BEFORE INSERT OR UPDATE ON controllable_unit_service_provider
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();

-- changeset flex:controllable-unit-service-provider-timeline-valid-start-window runOnChange:true endDelimiter:--
-- IFV: CUSP-VAL002
CREATE OR REPLACE TRIGGER
-- the _a_ in this name is to make sure it runs before other triggers
-- PostgreSQL runs triggers in alphabetical order
controllable_unit_service_provider_a_timeline_valid_start_window
BEFORE INSERT ON controllable_unit_service_provider
FOR EACH ROW
WHEN (
    current_role = 'flex_service_provider'
    and not timeline.is_empty('flex.controllable_unit_service_provider', 'controllable_unit_id', NEW.controllable_unit_id)
)
EXECUTE FUNCTION timeline.valid_start_window('2 weeks', '2 weeks');

-- changeset flex:controllable-unit-service-provider-no-duplicate runOnChange:true endDelimiter:--
-- IFV: CUSP-VAL003
CREATE OR REPLACE FUNCTION controllable_unit_service_provider_no_duplicates()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider
        WHERE controllable_unit_id = NEW.controllable_unit_id
          AND service_provider_id = NEW.service_provider_id
          AND valid_time_range && NEW.valid_time_range
          AND end_user_id = NEW.end_user_id
    ) THEN
        RAISE EXCEPTION 'Please update the existing contract instead of creating a new one.';
    END IF;

    RETURN NEW;
END
$$;

-- changeset flex:controllable-unit-service-provider-no-duplicate-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
-- alphabetic mark _a_ so it runs before make_room
controllable_unit_service_provider_a_no_duplicates
BEFORE INSERT ON controllable_unit_service_provider
FOR EACH ROW
WHEN (current_role = 'flex_service_provider')
EXECUTE FUNCTION controllable_unit_service_provider_no_duplicates();
