--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS service_provider_product_suspension (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    procuring_system_operator_id bigint NOT NULL DEFAULT (flex.current_party()),
    procuring_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
    ) STORED,
    product_type_ids bigint [] NOT NULL CHECK (
        product_type_ids_exists(product_type_ids)
    ),
    reason text NOT NULL CHECK (
        reason IN (
            'communication_issues',
            'failing_heartbeat',
            'system_issues',
            'clearing_issues',
            'failed_verification',
            'other'
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT service_provider_product_suspension_system_operator_fkey
    FOREIGN KEY (
        procuring_system_operator_id, procuring_system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT service_provider_product_suspension_service_provider_fkey
    FOREIGN KEY (
        service_provider_id, service_provider_party_type
    ) REFERENCES party (id, type)
);

-- changeset flex:service-provider-product-suspension-product-type-ids-insert-function runOnChange:true endDelimiter:--
-- trigger to check that the SO has qualified the SP for all inserted product types
CREATE OR REPLACE FUNCTION
service_provider_product_suspension_product_type_ids_insert()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_pt_id bigint;
BEGIN
    FOR l_pt_id IN SELECT unnest(NEW.product_type_ids) LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM flex.service_provider_product_application AS sppa
            WHERE sppa.service_provider_id = NEW.service_provider_id
            AND sppa.system_operator_id = NEW.procuring_system_operator_id
            AND sppa.status = 'qualified'
            AND l_pt_id = ANY(sppa.product_type_ids)
        ) THEN
            RAISE sqlstate 'PT400' using
                message =
                    'service provider is not qualified by system operator'
                        || ' for product type '
                        || (SELECT business_id FROM product_type WHERE id = l_pt_id);
            RETURN null;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- changeset flex:service-provider-product-suspension-product-type-ids-insert-trigger runOnChange:true endDelimiter:--
-- SPPS-VAL001
CREATE OR REPLACE TRIGGER
service_provider_product_suspension_product_type_ids_insert
BEFORE INSERT OR UPDATE ON service_provider_product_suspension
FOR EACH ROW
EXECUTE FUNCTION
service_provider_product_suspension_product_type_ids_insert();

-- changeset flex:service-provider-product-suspension-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_provider_product_suspension_event
AFTER INSERT OR UPDATE OR DELETE ON service_provider_product_suspension
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_provider_product_suspension');
