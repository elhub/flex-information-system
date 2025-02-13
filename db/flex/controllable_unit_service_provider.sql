-- SP relation for controllable unit
CREATE TABLE IF NOT EXISTS controllable_unit_service_provider (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    controllable_unit_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
    ) STORED,
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
    CONSTRAINT controllable_unit_service_provider_valid_time_overlap
    EXCLUDE USING gist (
        controllable_unit_id WITH =, valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

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

CREATE OR REPLACE TRIGGER controllable_unit_service_provider_event
AFTER INSERT OR UPDATE OR DELETE ON controllable_unit_service_provider
FOR EACH ROW
EXECUTE FUNCTION capture_event('controllable_unit_service_provider');
