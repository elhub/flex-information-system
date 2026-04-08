CREATE SCHEMA flex;

CREATE TABLE flex.controllable_unit (
    id bigint NOT NULL,
    business_id text NOT NULL,
    name text NOT NULL,
    start_date date NULL,
    status text NOT NULL,
    regulation_direction text NOT NULL,
    maximum_active_power decimal NOT NULL,
    is_small boolean NOT NULL,
    accounting_point_id bigint NOT NULL,
    additional_information text NULL,
    created_by_party_id bigint NOT NULL,
    record_time_range tstzrange NOT NULL,
    recorded_by bigint NOT NULL
);
CREATE TABLE flex.technical_resource (
    id bigint NOT NULL,
    name text NOT NULL,
    controllable_unit_id bigint NOT NULL,
    technology text [] NOT NULL,
    category text [] NOT NULL,
    maximum_active_power decimal NOT NULL,
    device_type text NOT NULL,
    make text NULL,
    model text NULL,
    business_id text NULL,
    business_id_type text NULL,
    additional_information text NULL,
    record_time_range tstzrange NOT NULL,
    recorded_by bigint NOT NULL
);
CREATE TABLE flex.accounting_point (
    id bigint NOT NULL,
    business_id text NOT NULL,
    system_operator_id bigint NOT NULL,
    record_time_range tstzrange NOT NULL,
    recorded_by bigint NOT NULL
);
