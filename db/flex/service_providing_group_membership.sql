-- TODO: consider relating SPG to CU-SP instead of only CU
--       (to have consistency by construction)

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

CREATE OR REPLACE TRIGGER service_providing_group_membership_upsert_consistency
BEFORE INSERT OR UPDATE ON service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE consistency_on_spgm_valid_time_increase();

CREATE OR REPLACE TRIGGER spgm_insert_grid_prequalification
AFTER INSERT ON service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION
add_spg_grid_prequalifications_for_future_impacted_system_operators();

CREATE OR REPLACE TRIGGER service_providing_group_membership_event
AFTER INSERT OR UPDATE OR DELETE ON service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_membership');

CREATE OR REPLACE TRIGGER
service_providing_group_membership_timeline_midnight_aligned
AFTER INSERT OR UPDATE ON service_providing_group_membership
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();
