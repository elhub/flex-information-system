-- SP relation for controllable unit
CREATE TABLE IF NOT EXISTS controllable_unit_service_provider (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    controllable_unit_id bigint NOT NULL,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
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

-- IFV: CUSP-IFV001
CREATE OR REPLACE TRIGGER controllable_unit_service_provider_valid_time_freeze
BEFORE UPDATE ON controllable_unit_service_provider
FOR EACH ROW
WHEN (current_role = 'flex_service_provider')
EXECUTE FUNCTION timeline_freeze('2 weeks');

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_timeline_midnight_aligned
BEFORE INSERT OR UPDATE ON controllable_unit_service_provider
FOR EACH ROW
EXECUTE FUNCTION timeline_midnight_aligned();

-- IFV: CUSP-IFV002
CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_timeline_valid_start_window
BEFORE INSERT ON controllable_unit_service_provider
FOR EACH ROW
WHEN (current_role = 'flex_service_provider')
EXECUTE FUNCTION timeline_valid_start_window('2 weeks', '2 weeks');

CREATE OR REPLACE FUNCTION
controllable_unit_service_provider_spg_membership_consistency()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    -- ranges removed in the update operation, see comment below
    l_removed_valid_time_ranges tstzrange[];
    l_removed tstzrange;

    -- loop variable for each concerned SPGM
    l_spgm record;
    -- remaining valid time range of each SPGM after CUSP update
    l_valid_range_remaining tstzrange;
BEGIN
    -- delete CUSP -> delete SPGM on that period
    IF TG_OP = 'DELETE' THEN
        DELETE FROM service_providing_group_membership
        WHERE controllable_unit_id = OLD.controllable_unit_id
            AND service_provider_id = OLD.service_provider_id
            AND OLD.valid_time_range @> valid_time_range;
        RETURN null;
    END IF;

    -- update CUSP -> restrict SPGM of the former period based on the new period

    -- By hypothesis, SPGMs are all fully included in one CUSP. When this CUSP
    -- is updated, we just have to restrict the SPGM to its part that is still
    -- included in the new CUSP. We do this with intersection with the new valid
    -- time range. If the intersection is empty (SPGM now 0% covered by the new
    -- CUSP), we delete the SPGM.

    FOR l_spgm IN
        SELECT spgm.id, spgm.valid_time_range
        FROM service_providing_group_membership AS spgm
        INNER JOIN service_providing_group AS spg
            ON spgm.service_providing_group_id = spg.id
        WHERE spgm.controllable_unit_id = NEW.controllable_unit_id
            AND spg.service_provider_id = NEW.service_provider_id
            AND OLD.valid_time_range @> spgm.valid_time_range
    LOOP
        l_new_spgm_valid_time_range :=
            l_spgm.valid_time_range * NEW.valid_time_range;
        IF isempty(l_new_spgm_valid_time_range) THEN
            DELETE FROM service_providing_group_membership
            WHERE id = l_spgm.id;
        ELSE
            UPDATE service_providing_group_membership
            SET valid_time_range = l_new_spgm_valid_time_range
            WHERE id = l_spgm.id;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_spg_membership_consistency
BEFORE UPDATE OR DELETE ON controllable_unit_service_provider
FOR EACH ROW
EXECUTE FUNCTION
controllable_unit_service_provider_spg_membership_consistency();
