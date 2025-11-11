-- manually maintained file

-- contains information for sqlc about additional private views that are not in
-- the API specification, but are still used internally in the backend queries

CREATE TABLE accounting_point_end_user (
    id bigint NOT NULL,
    accounting_point_id bigint NOT NULL,
    end_user_id bigint NOT NULL,
    valid_time_range tstzrange NOT NULL,
    record_time_range tstzrange NOT NULL,
    recorded_by bigint NOT NULL
);

CREATE TABLE controllable_unit_system_operator (
    controllable_unit_id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    valid_time_range tstzrange NOT NULL
);
