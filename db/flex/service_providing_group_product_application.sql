--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-create runOnChange:true endDelimiter:--
-- relation between SPG and SO with the product type
CREATE TABLE IF NOT EXISTS service_providing_group_product_application (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_providing_group_id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    procuring_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    product_type_ids bigint [] NOT NULL CHECK (
        product_type_ids_exists(product_type_ids)
    ),
    status text NOT NULL DEFAULT 'requested' CHECK (
        status IN (
            'requested',
            'prequalification_pending',
            'in_progress',
            'temporary_qualified',
            'prequalified',
            'verified',
            'rejected'
        )
    ),
    notes text NULL CHECK (
        char_length(notes) <= 512
    ),
    prequalified_at timestamp with time zone NULL,
    verified_at timestamp with time zone NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT service_providing_group_product_application_spg_fkey
    FOREIGN KEY (service_providing_group_id)
    REFERENCES service_providing_group (id),
    CONSTRAINT service_providing_group_product_application_system_operator_fkey
    FOREIGN KEY (
        procuring_system_operator_id, procuring_system_operator_party_type
    ) REFERENCES party (id, type)
);

-- changeset flex:service-providing-group-product-application-insert-on-active-spg-function runOnChange:true endDelimiter:--
-- trigger to check that the SPG is active before adding a product application
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_insert_on_active_spg()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF (
        SELECT status FROM service_providing_group
        WHERE id = NEW.service_providing_group_id
    ) <> 'active'
    THEN
        RAISE sqlstate 'PT400' using
            message = 'service providing group is not active';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-product-application-insert-on-active-spg-trigger runOnChange:true endDelimiter:--
-- SPGPA-VAL001
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_insert_on_active_spg
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_insert_on_active_spg();

-- changeset flex:service-providing-group-product-application-sp-status-update-function runOnChange:true endDelimiter:--
-- trigger to check that a status update done by the SP is always a reset
-- i.e., rejected->requested
CREATE OR REPLACE FUNCTION
service_providing_group_product_application_sp_status_update()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF
        current_role = 'flex_service_provider'
        AND NOT (OLD.status = 'rejected' AND NEW.status = 'requested')
    THEN
        RAISE sqlstate 'PT400' using
            message =
                'a service provider can only request a new application process'
                || ' when it is rejected';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:service-providing-group-product-application-sp-status-update-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_sp_status_update
BEFORE UPDATE OF status ON service_providing_group_product_application
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION
service_providing_group_product_application_sp_status_update();

-- changeset flex:service-providing-group-product-application-status-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_status_insert
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION status.restrict_insert('requested');

-- changeset flex:service-providing-group-product-application-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER service_providing_group_product_application_event
AFTER INSERT OR UPDATE ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_product_application');

-- changeset flex:service-providing-group-product-application-check-timestamp-on-status-update runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER spgpa_check_timestamp_on_status_prequalified
BEFORE UPDATE ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION utils.check_timestamp_on_status_update(
    'prequalified_at', 'status',
    '{prequalified}', -- SPGPA-VAL004
    '{rejected}'      -- SPGPA-VAL006
);

CREATE OR REPLACE TRIGGER spgpa_check_timestamp_on_status_verified
BEFORE UPDATE ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION utils.check_timestamp_on_status_update(
    'verified_at', 'status',
    '{verified}', -- SPGPA-VAL005
    '{rejected}'  -- SPGPA-VAL006
);
