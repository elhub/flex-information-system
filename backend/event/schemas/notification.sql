-- manually maintained file

CREATE SCHEMA notification;

CREATE TABLE notification.controllable_unit_end_user (
    controllable_unit_id bigint NOT NULL,
    end_user_id bigint NOT NULL,
    valid_time_range tstzrange NOT NULL
);

CREATE TABLE notification.controllable_unit_system_operator (
    controllable_unit_id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    valid_time_range tstzrange NOT NULL
);

CREATE TABLE notification.event (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    source_resource TEXT NOT NULL,
    source_id BIGINT NOT NULL,
    subject_resource TEXT NULL,
    subject_id BIGINT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    recorded_at TIMESTAMPTZ NOT NULL,
    recorded_by BIGINT NOT NULL
);
