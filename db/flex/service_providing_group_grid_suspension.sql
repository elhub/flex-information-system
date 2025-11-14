--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-suspension-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS service_providing_group_grid_suspension (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    impacted_system_operator_id bigint NOT NULL DEFAULT (flex.current_party()),
    impacted_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    service_providing_group_id bigint NOT NULL,
    reason text NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT service_providing_group_grid_suspension_reason_check CHECK (
        reason IN (
            'breach_of_conditions',
            'significant_group_change',
            'other'
        )
    ),
    CONSTRAINT service_providing_group_grid_suspension_system_operator_fkey
    FOREIGN KEY (
        impacted_system_operator_id, impacted_system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT
    service_providing_group_grid_suspension_service_providing_group_fkey
    FOREIGN KEY (service_providing_group_id)
    REFERENCES service_providing_group (id)
);

-- changeset flex:service-providing-group-grid-suspension-spg-iso-uk runOnChange:true endDelimiter:--
-- only one active suspension per ISO per SPG
CREATE UNIQUE INDEX IF NOT EXISTS
uk_service_providing_group_grid_suspension_iso_spg
ON service_providing_group_grid_suspension (
    impacted_system_operator_id,
    service_providing_group_id
);

-- changeset flex:service-providing-group-grid-suspension-upsert-function runOnChange:true endDelimiter:--
-- trigger to check that the suspending SO has qualified the SPG
CREATE OR REPLACE FUNCTION service_providing_group_grid_suspension_upsert()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_prequalification AS spggp
        WHERE spggp.service_providing_group_id = NEW.service_providing_group_id
        AND spggp.impacted_system_operator_id = NEW.impacted_system_operator_id
        AND spg_grid_prequalification_ready_for_market_check(spggp)
    ) THEN
        RAISE sqlstate 'PT400' using
            message =
                'service providing group is not qualified by impacted system operator';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-grid-suspension-upsert-trigger runOnChange:true endDelimiter:--
-- SPGGS-VAL001
CREATE OR REPLACE TRIGGER
service_providing_group_grid_suspension_upsert
BEFORE INSERT OR UPDATE ON service_providing_group_grid_suspension
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_grid_suspension_upsert();

-- changeset flex:service-providing-group-grid-suspension-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_grid_suspension_event
AFTER INSERT OR UPDATE OR DELETE ON service_providing_group_grid_suspension
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_grid_suspension');
