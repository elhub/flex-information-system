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
            'significant_alteration',
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

-- changeset flex:service-providing-group-grid-suspension-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_grid_suspension_event
AFTER INSERT OR UPDATE OR DELETE ON service_providing_group_grid_suspension
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_grid_suspension');
