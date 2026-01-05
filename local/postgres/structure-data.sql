INSERT INTO flex.entity (
    name, type, business_id, business_id_type
)
VALUES
('LB Entity AS', 'organisation', '123456789', 'org'),
('LB Nett AS', 'organisation', '987654321', 'org');

INSERT INTO flex.metering_grid_area (
    business_id,
    name,
    price_area,
    system_operator_id,
    valid_time_range
)
VALUES
(
    '42YTEST-TEST-00P',
    'TEST MGA',
    'NO3',
    (
        SELECT id FROM flex.party
        WHERE business_id = '1337123400004'
    ),
    tstzrange('2000-01-01 Europe/Oslo', null)
);

INSERT INTO flex.party (
    business_id,
    business_id_type,
    entity_id,
    name,
    type,
    role,
    status
)
VALUES
(
    '123456789',
    'org',
    (
        SELECT id FROM flex.entity
        WHERE business_id = '123456789'
    ),
    'LB Entity AS',
    'organisation',
    'flex_organisation',
    'active'
),
(
    'a8976a02-15ab-4740-89fa-38f9924b4f87',
    'uuid',
    (
        SELECT id FROM flex.entity
        WHERE business_id = '123456789'
    ),
    'LB Entity AS',
    'end_user',
    'flex_end_user',
    'active'
),
(
    '1337123400004',
    'gln',
    (
        SELECT id FROM flex.entity
        WHERE business_id = '987654321'
    ),
    'LB Nett AS',
    'system_operator',
    'flex_system_operator',
    'active'
);
