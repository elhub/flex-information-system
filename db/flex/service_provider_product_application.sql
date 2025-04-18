-- foreign key check but for an array
CREATE OR REPLACE FUNCTION product_type_ids_check(
    product_type_ids bigint []
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
    SELECT NOT EXISTS (
        SELECT product_type_id FROM unnest(product_type_ids) product_type_id -- noqa
        WHERE NOT EXISTS (
                SELECT 1 FROM product_type WHERE id = product_type_id
            )
    )
$$;

-- relation between SP and SO with its product types
CREATE TABLE IF NOT EXISTS service_provider_product_application (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    service_provider_id bigint NOT NULL,
    service_provider_party_type text GENERATED ALWAYS AS (
        'service_provider'
    ) STORED,
    system_operator_id bigint NOT NULL,
    system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    -- array of product types
    -- Storing it as one field makes the foreign key checks a bit harder,
    -- but it is much easier for the user in the UI to add or remove product
    -- types instead of manipulating a subresource.
    product_type_ids bigint [] NOT NULL CHECK (
        -- This foreign key check only checks that the product type is valid.
        -- Any further validation (such as allowing only types related to the
        -- SO) is done with triggers on the operations. We do this because we
        -- want to keep things simple and not be forced to set up a cascading
        -- delete/update operation if a product type becomes inactive for an SO.
        product_type_ids_check(product_type_ids)
    ),
    status text NOT NULL DEFAULT 'requested' CHECK (
        status IN (
            'requested',
            'in_progress',
            'communication_test',
            'not_qualified',
            'qualified'
        )
    ),
    notes text NULL CHECK (
        char_length(notes) <= 512
    ),
    last_qualified timestamp with time zone NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT service_provider_product_application_service_provider_fkey
    FOREIGN KEY (
        service_provider_id, service_provider_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT service_provider_product_application_system_operator_fkey
    FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type)
);

-- trigger to check that the inserted product types are active for the SO

CREATE OR REPLACE FUNCTION
service_provider_product_application_product_type_ids_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_pt_id bigint;
BEGIN
    FOR l_pt_id IN SELECT unnest(NEW.product_type_ids) LOOP
        IF NOT EXISTS (
            SELECT 1 FROM system_operator_product_type
            WHERE system_operator_id = NEW.system_operator_id
            AND product_type_id = l_pt_id
            AND status = 'active'
        ) THEN
            RAISE sqlstate 'PT400' using
                message =
                    'product type ' ||
                        (SELECT business_id FROM product_type WHERE id = l_pt_id)
                        || ' is not active for system operator';
            RETURN null;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- SPPA-VAL001
CREATE OR REPLACE TRIGGER
service_provider_product_application_product_type_ids_insert
BEFORE INSERT ON service_provider_product_application
FOR EACH ROW
EXECUTE FUNCTION
service_provider_product_application_product_type_ids_insert();

-- RLS: SPPA-SP002
-- reject updates by SP if the status is not `requested`
CREATE OR REPLACE FUNCTION
service_provider_product_application_product_type_ids_update()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF OLD.status != 'requested' THEN
        RAISE sqlstate 'PT400' using
            message =
                'status is no longer requested, cannot update product types';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
service_provider_product_application_product_type_ids_update
BEFORE UPDATE OF product_type_ids ON service_provider_product_application
FOR EACH ROW
WHEN (
    NEW.product_type_ids IS DISTINCT FROM OLD.product_type_ids -- noqa
    AND current_role = 'flex_service_provider'
)
EXECUTE FUNCTION
service_provider_product_application_product_type_ids_update();

-- trigger to first set the last qualified timestamp if not done by the user

CREATE OR REPLACE FUNCTION
service_provider_product_application_status_qualified()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.last_qualified := current_timestamp;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER service_provider_product_application_status_qualified
BEFORE UPDATE OF status ON service_provider_product_application
FOR EACH ROW
WHEN (
    OLD.status IS DISTINCT FROM NEW.status -- noqa
    AND NEW.status = 'qualified' -- noqa
    AND OLD.last_qualified IS NULL AND NEW.last_qualified IS NULL -- noqa
)
EXECUTE FUNCTION service_provider_product_application_status_qualified();

--

CREATE OR REPLACE TRIGGER service_provider_product_application_status_insert
BEFORE INSERT ON service_provider_product_application
FOR EACH ROW
EXECUTE FUNCTION status_insert('requested');

CREATE OR REPLACE TRIGGER
service_provider_product_application_status_update
BEFORE UPDATE OF status ON service_provider_product_application
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status_update('requested');

CREATE OR REPLACE TRIGGER service_provider_product_application_event
AFTER INSERT OR UPDATE ON service_provider_product_application
FOR EACH ROW
EXECUTE FUNCTION capture_event('service_provider_product_application');
