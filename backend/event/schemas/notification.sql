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
