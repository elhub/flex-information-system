--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-suspension-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS controllable_unit_suspension (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    impacted_system_operator_id bigint NOT NULL DEFAULT (flex.current_party()),
    impacted_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    controllable_unit_id bigint NOT NULL,
    reason text NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT controllable_unit_suspension_reason_check CHECK (
        reason IN (
            'compromises_safe_operation',
            'other'
        )
    ),
    CONSTRAINT controllable_unit_suspension_system_operator_fkey
    FOREIGN KEY (
        impacted_system_operator_id, impacted_system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT
    controllable_unit_suspension_controllable_unit_fkey
    FOREIGN KEY (controllable_unit_id)
    REFERENCES controllable_unit (id)
);
