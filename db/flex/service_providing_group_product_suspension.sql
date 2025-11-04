--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-suspension-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS service_providing_group_product_suspension (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    procuring_system_operator_id bigint NOT NULL DEFAULT (flex.current_party()),
    procuring_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    service_providing_group_id bigint NOT NULL,
    product_type_ids bigint [] NOT NULL CHECK (
        product_type_ids_exists(product_type_ids)
    ),
    reason text NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT service_providing_group_product_suspension_reason_check
    CHECK (
        reason IN (
            'failed_verification',
            'other'
        )
    ),
    CONSTRAINT service_providing_group_product_suspension_system_operator_fkey
    FOREIGN KEY (
        procuring_system_operator_id, procuring_system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT service_providing_group_product_suspension_spg_fkey
    FOREIGN KEY (service_providing_group_id)
    REFERENCES service_providing_group (id)
);

-- changeset flex:service-providing-group-product-suspension-product-type-ids-insert-function runOnChange:true endDelimiter:--
-- trigger to check that the SO has qualified the SPG for all suspended product types
CREATE OR REPLACE FUNCTION
service_providing_group_product_suspension_product_type_ids_insert()
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
            FROM flex.service_providing_group_product_application AS spgpa
            WHERE spgpa.service_providing_group_id
            = NEW.service_providing_group_id
            AND spgpa.procuring_system_operator_id
            = NEW.procuring_system_operator_id
            AND (
                spgpa.status = 'temporary_qualified'
                OR spgpa.prequalified_at IS NOT null
                OR spgpa.verified_at IS NOT null
            )
            AND l_pt_id = ANY(spgpa.product_type_ids)
        ) THEN
            RAISE sqlstate 'PT400' using
                message =
                    'service providing group is not qualified by system operator'
                        || ' for product type '
                        || (SELECT business_id FROM product_type WHERE id = l_pt_id);
            RETURN null;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-product-suspension-product-type-ids-insert-trigger runOnChange:true endDelimiter:--
-- SPGPS-VAL001
CREATE OR REPLACE TRIGGER
service_providing_group_product_suspension_product_type_ids_insert
BEFORE INSERT OR UPDATE ON service_providing_group_product_suspension
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_suspension_product_type_ids_insert();

-- changeset flex:service-providing-group-product-suspension-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_product_suspension_event
AFTER INSERT OR UPDATE OR DELETE ON service_providing_group_product_suspension
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_product_suspension');
