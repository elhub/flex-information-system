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
    notes text NULL CHECK (char_length(notes) <= 512),
    last_prequalified timestamp with time zone NULL,
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

CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_status_insert
BEFORE INSERT ON service_providing_group_grid_prequalification
FOR EACH ROW
EXECUTE FUNCTION status_insert('requested');

CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_status_update
BEFORE UPDATE OF status ON service_providing_group_grid_prequalification
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status_update('requested');

CREATE OR REPLACE FUNCTION spg_grid_prequalification_status_approved()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.last_prequalified := current_timestamp;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER spg_grid_prequalification_status_approved
BEFORE UPDATE OF status
ON service_providing_group_grid_prequalification
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'approved' -- noqa
    AND OLD.last_prequalified IS NULL AND NEW.last_prequalified IS NULL -- noqa
)
EXECUTE FUNCTION spg_grid_prequalification_status_approved();

CREATE OR REPLACE TRIGGER service_providing_group_grid_prequalification_event
AFTER INSERT OR UPDATE ON service_providing_group_grid_prequalification
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_grid_prequalification');
