-- relation between SPG and SO with the product type
CREATE TABLE IF NOT EXISTS service_providing_group_product_application (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_providing_group_id bigint NOT NULL,
    procuring_system_operator_id bigint NOT NULL,
    procuring_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    product_type_id bigint NOT NULL,
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
    last_prequalified timestamp with time zone NULL,
    last_verified timestamp with time zone NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    UNIQUE (
        service_providing_group_id,
        procuring_system_operator_id,
        product_type_id
    ),

    CONSTRAINT service_providing_group_product_application_spg_fkey
    FOREIGN KEY (service_providing_group_id)
    REFERENCES service_providing_group (id),
    CONSTRAINT service_providing_group_product_application_system_operator_fkey
    FOREIGN KEY (
        procuring_system_operator_id, procuring_system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT service_providing_group_product_application_product_type_fkey
    FOREIGN KEY (product_type_id)
    REFERENCES product_type (id)
);

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

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_insert_on_active_spg
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_insert_on_active_spg();

-- trigger to check that the inserted product type is active for the SO

CREATE OR REPLACE FUNCTION
service_providing_group_product_application_product_type_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM system_operator_product_type
        WHERE system_operator_id = NEW.procuring_system_operator_id
        AND product_type_id = NEW.product_type_id
        AND status = 'active'
    ) THEN
        RAISE sqlstate 'PT400' using
            message =
                'product type ' || (
                    SELECT business_id FROM product_type
                    WHERE id = NEW.product_type_id
                ) || ' is not active for system operator';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_product_type_insert
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_product_type_insert();

-- trigger to check that the SP inserting the SPGPA was qualified by the SO
-- for this product type

CREATE OR REPLACE FUNCTION
service_providing_group_product_application_sp_qualified_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_sp_id bigint;
BEGIN
    SELECT service_provider_id INTO l_sp_id
    FROM service_providing_group
    WHERE id = NEW.service_providing_group_id;

    IF NEW.product_type_id NOT IN (
        SELECT unnest(product_type_ids)
        FROM service_provider_product_application
        WHERE service_provider_id = l_sp_id
        AND system_operator_id = NEW.procuring_system_operator_id
        AND status = 'qualified'
    ) THEN
        RAISE sqlstate 'PT400' using
            message =
                'service provider is not qualified for product type ' || (
                    SELECT business_id FROM product_type
                    WHERE id = NEW.product_type_id
                ) || 'for this system operator';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_sp_qualified_insert
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_providing_group_product_application_sp_qualified_insert();

-- trigger to first set the last prequalified timestamp if not done by the user

CREATE OR REPLACE FUNCTION
service_providing_group_product_application_status_prequalified()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.last_prequalified := current_timestamp;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_status_prequalified
BEFORE UPDATE OF status ON service_providing_group_product_application
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'prequalified' -- noqa
    AND OLD.last_prequalified IS NULL AND NEW.last_prequalified IS NULL -- noqa
)
EXECUTE FUNCTION
service_providing_group_product_application_status_prequalified();

-- trigger to first set the last verified timestamp if not done by the user

CREATE OR REPLACE FUNCTION
service_providing_group_product_application_status_verified()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.last_verified := current_timestamp;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_status_verified
BEFORE UPDATE OF status ON service_providing_group_product_application
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'verified' -- noqa
    AND OLD.last_verified IS NULL AND NEW.last_verified IS NULL -- noqa
)
EXECUTE FUNCTION service_providing_group_product_application_status_verified();

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

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_sp_status_update
BEFORE UPDATE OF status ON service_providing_group_product_application
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION
service_providing_group_product_application_sp_status_update();

--

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_status_insert
BEFORE INSERT ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION status_insert('requested');

CREATE OR REPLACE TRIGGER service_providing_group_product_application_event
AFTER INSERT OR UPDATE ON service_providing_group_product_application
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_providing_group_product_application');
