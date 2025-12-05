--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-membership-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS service_providing_group_membership (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    controllable_unit_id bigint NOT NULL,
    service_providing_group_id bigint NOT NULL,
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

    CONSTRAINT fk_service_providing_group_membership_controllable_unit_id
    FOREIGN KEY (controllable_unit_id)
    REFERENCES controllable_unit (id),
    CONSTRAINT fk_service_providing_group_membership_service_providing_group_id
    FOREIGN KEY (service_providing_group_id)
    REFERENCES service_providing_group (id),
    CONSTRAINT service_providing_group_membership_valid_time_overlap
    EXCLUDE USING gist (
        controllable_unit_id WITH =,
        service_providing_group_id WITH =,
        valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

-- changeset flex:service-providing-group-membership-consistency-on-valid-time-increase runOnChange:true endDelimiter:--
-- SPGM-VAL001: The controllable unit and service providing group must belong to the same service provider.
CREATE OR REPLACE FUNCTION consistency_on_spgm_valid_time_increase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  -- the new SPGM is covered by the CU-SP valid timeline
  lv_covered boolean;
  lv_service_provider_id INTEGER;
BEGIN

    select service_provider_id into lv_service_provider_id
    from flex.service_providing_group spg
    where spg.id = NEW.service_providing_group_id;

    select range_agg(cusp.valid_time_range) @> NEW.valid_time_range
    into lv_covered
    from flex.controllable_unit_service_provider as cusp
    where cusp.controllable_unit_id = NEW.controllable_unit_id
    and cusp.service_provider_id = lv_service_provider_id
    and cusp.valid_time_range && NEW.valid_time_range;

    IF NOT lv_covered THEN
      RAISE 'The CU must be managed by the SP from % to %',
        timeline.timestamptz_to_text(lower(NEW.valid_time_range)),
        timeline.timestamptz_to_text(upper(NEW.valid_time_range));
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-membership-cusp-consistency-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_membership_cusp_consistency
BEFORE INSERT OR UPDATE ON service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE consistency_on_spgm_valid_time_increase();

-- changeset flex:service-providing-group-membership-upsert-consistency-trigger-drop runOnChange:true endDelimiter:--
-- TODO: remove once rollout is complete
DROP TRIGGER IF EXISTS service_providing_group_membership_upsert_consistency
ON service_providing_group_membership;

-- changeset flex:service-providing-group-membership-bidding-zone-consistency runOnChange:true endDelimiter:--
-- SPGM-VAL002: The bidding zone of the SPGM must be consistent with the bidding zone of the CU.
CREATE OR REPLACE FUNCTION
service_providing_group_membership_bidding_zone_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- the new SPGM is covered by the CU-BZ valid timeline
  lv_covered boolean;
  lv_spg_bidding_zone text;
BEGIN

    select bidding_zone into lv_spg_bidding_zone
    from flex.service_providing_group spg
    where spg.id = NEW.service_providing_group_id;

    select
        COALESCE(range_agg(cubz.valid_time_range) @> NEW.valid_time_range, false)
    into lv_covered
    from flex.controllable_unit_bidding_zone as cubz
    where cubz.controllable_unit_id = NEW.controllable_unit_id
    and cubz.bidding_zone = lv_spg_bidding_zone
    and cubz.valid_time_range && NEW.valid_time_range;

    IF NOT lv_covered THEN
      RAISE 'The CU is not in the SPGs bidding zone % from % to %',
        lv_spg_bidding_zone,
        timeline.timestamptz_to_text(lower(NEW.valid_time_range)),
        timeline.timestamptz_to_text(upper(NEW.valid_time_range));
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-membership-bidding-zone-consistency-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_membership_bidding_zone_consistency
BEFORE INSERT OR UPDATE ON
service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE
service_providing_group_membership_bidding_zone_consistency();


-- changeset flex:service-providing-group-insert-grip-prequalificaton-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
spgm_insert_grid_prequalification()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_spg_status text;
BEGIN
    SELECT status INTO l_spg_status
    FROM flex.service_providing_group
    WHERE id = NEW.service_providing_group_id;

    IF l_spg_status = 'active' THEN
        PERFORM add_spg_grid_prequalifications_for_future_impacted_system_operators(
            NEW.service_providing_group_id
        );
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-insert-grip-prequalificaton-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER spgm_insert_grid_prequalification
AFTER INSERT ON service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION
spgm_insert_grid_prequalification();

-- changeset flex:service-providing-group-membership-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_membership_event
AFTER INSERT OR UPDATE OR DELETE ON service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_membership');

-- changeset flex:service-providing-group-membership-timeline-midnight-aligned runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_membership_timeline_midnight_aligned
AFTER INSERT OR UPDATE ON service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();
