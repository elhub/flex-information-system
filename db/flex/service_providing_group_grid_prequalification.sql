--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-create runOnChange:false endDelimiter:--
-- validCheckSum: 9:76cd8e2f4596c1bd2e019d353f952dba
CREATE TABLE IF NOT EXISTS service_providing_group_grid_prequalification (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_providing_group_id bigint NOT NULL,
    impacted_system_operator_id bigint NOT NULL,
    impacted_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    status text NOT NULL DEFAULT 'requested' CHECK (
        status IN (
            'requested',
            'in_progress',
            'conditionally_approved',
            'approved',
            'not_approved'
        )
    ),
    prequalified_at timestamp with time zone NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_service_providing_group_grid_prequalification_service_providing_group_id -- noqa
    FOREIGN KEY (service_providing_group_id)
    REFERENCES service_providing_group (id),
    CONSTRAINT fk_service_providing_group_grid_prequalification_impacted_system_operator_id -- noqa
    FOREIGN KEY (
        impacted_system_operator_id, impacted_system_operator_party_type
    ) REFERENCES party (id, type),
    UNIQUE (service_providing_group_id, impacted_system_operator_id)
);

-- changeset flex:service-providing-group-grid-prequalification-ready-for-market-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION spg_grid_prequalification_ready_for_market_check(
    spggp record
)
RETURNS boolean
SECURITY INVOKER
IMMUTABLE
LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN (
        spggp.status IN ('approved', 'conditionally_approved')
        OR spggp.prequalified_at IS NOT null
    );
END;
$$;

-- changeset flex:service-providing-group-grid-prequalification-status-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_status_insert
BEFORE INSERT ON service_providing_group_grid_prequalification
FOR EACH ROW
EXECUTE FUNCTION status.restrict_insert('requested');

-- changeset flex:service-providing-group-grid-prequalification-status-update-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_status_update
BEFORE UPDATE OF status ON service_providing_group_grid_prequalification
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status.restrict_update('requested');

-- changeset flex:service-providing-group-grid-prequalification-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_grid_prequalification_event
AFTER INSERT OR UPDATE ON service_providing_group_grid_prequalification
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_grid_prequalification');

-- changeset flex:service-providing-group-grid-prequalification-check-timestamp-on-status-update runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_check_timestamp_on_status_update
BEFORE UPDATE ON service_providing_group_grid_prequalification
FOR EACH ROW
EXECUTE FUNCTION utils.check_timestamp_on_status_update(
    'prequalified_at', 'status',
    '{approved, conditionally_approved}',
    '{not_approved}'
);
