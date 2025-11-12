-- manually maintained file

CREATE SCHEMA notification;

CREATE TABLE notification.controllable_unit_system_operator (
    controllable_unit_id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    valid_time_range tstzrange NOT NULL
);

CREATE TABLE notification.accounting_point_end_user (
    id bigint NOT NULL,
    accounting_point_id bigint NOT NULL,
    end_user_id bigint NOT NULL,
    valid_time_range tstzrange NOT NULL,
    record_time_range tstzrange NOT NULL,
    recorded_by bigint NOT NULL
);
