--liquibase formatted sql
-- Manually managed file

-- changeset flex:system-operator-product-type-create runOnChange:false endDelimiter:--
-- relation between SO and product type
CREATE TABLE IF NOT EXISTS system_operator_product_type (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    system_operator_id bigint NOT NULL,
    system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    product_type_id bigint NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (
        status = 'active' OR status = 'inactive'
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    UNIQUE (system_operator_id, product_type_id),

    CONSTRAINT system_operator_product_type_system_operator_fkey
    FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT system_operator_product_type_product_type_fkey
    FOREIGN KEY (
        product_type_id
    ) REFERENCES product_type (id)
);

-- changeset flex:system-operator-product-type-status-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER system_operator_product_type_status_insert
BEFORE INSERT ON system_operator_product_type
FOR EACH ROW
EXECUTE FUNCTION status.restrict_insert('active');

-- changeset flex:system-operator-product-type-status-update-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER system_operator_product_type_event
AFTER INSERT OR UPDATE ON system_operator_product_type
FOR EACH ROW
EXECUTE FUNCTION capture_event('system_operator_product_type');
