--liquibase formatted sql
-- Manually managed file

-- changeset flex:technical-resource-add-technology runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'technology'
ALTER TABLE flex.technical_resource
ADD COLUMN technology text [] NOT NULL DEFAULT '{other.consumption}';

ALTER TABLE flex.technical_resource_history
ADD COLUMN technology text [] NOT NULL DEFAULT '{other.consumption}';

ALTER TABLE flex.technical_resource
ALTER COLUMN technology DROP DEFAULT;

ALTER TABLE flex.technical_resource_history
ALTER COLUMN technology DROP DEFAULT;

-- changeset flex:technical-resource-add-category runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'category'
ALTER TABLE flex.technical_resource
ADD COLUMN category text [] NOT NULL DEFAULT '{consumption}';

ALTER TABLE flex.technical_resource_history
ADD COLUMN category text [] NOT NULL DEFAULT '{consumption}';

-- changeset flex:technical-resource-add-maximum-active-power runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'maximum_active_power'
ALTER TABLE flex.technical_resource
ADD COLUMN maximum_active_power decimal(9, 3) NOT NULL DEFAULT 0;

ALTER TABLE flex.technical_resource_history
ADD COLUMN maximum_active_power decimal(9, 3) NOT NULL DEFAULT 0;

ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_maximum_active_power
CHECK (maximum_active_power >= 0 AND maximum_active_power <= 999999.999);

ALTER TABLE flex.technical_resource
ALTER COLUMN maximum_active_power DROP DEFAULT;

ALTER TABLE flex.technical_resource_history
ALTER COLUMN maximum_active_power DROP DEFAULT;

-- changeset flex:technical-resource-add-device-type runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'device_type'
ALTER TABLE flex.technical_resource
ADD COLUMN device_type text NOT NULL DEFAULT 'other';

ALTER TABLE flex.technical_resource_history
ADD COLUMN device_type text NOT NULL DEFAULT 'other';

ALTER TABLE flex.technical_resource
ALTER COLUMN device_type DROP DEFAULT;

ALTER TABLE flex.technical_resource_history
ALTER COLUMN device_type DROP DEFAULT;

-- changeset flex:technical-resource-add-make runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'make'
ALTER TABLE flex.technical_resource
ADD COLUMN make text;

ALTER TABLE flex.technical_resource_history
ADD COLUMN make text;

ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_make_length
CHECK (char_length(make) <= 128);

-- changeset flex:technical-resource-add-model runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'model'
ALTER TABLE flex.technical_resource
ADD COLUMN model text;

ALTER TABLE flex.technical_resource_history
ADD COLUMN model text;

ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_model_length
CHECK (char_length(model) <= 128);

-- changeset flex:technical-resource-add-business-id runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'business_id'
ALTER TABLE flex.technical_resource
ADD COLUMN business_id text;

ALTER TABLE flex.technical_resource_history
ADD COLUMN business_id text;

ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_business_id_length
CHECK (char_length(business_id) <= 256);

-- changeset flex:technical-resource-add-business-id-type runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'business_id_type'
ALTER TABLE flex.technical_resource
ADD COLUMN business_id_type text REFERENCES flex.business_id_type (name);

ALTER TABLE flex.technical_resource_history
ADD COLUMN business_id_type text;

ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_business_id_type
CHECK (business_id_type IN ('serial_number', 'mac', 'other'));

-- changeset flex:technical-resource-add-make-required-constraint runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND constraint_name = 'check_technical_resource_make_required'
ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_make_required
CHECK (
    make IS NOT NULL
    OR (
        model IS NULL
        AND business_id IS NULL
        AND business_id_type IS NULL
    )
);

-- changeset flex:technical-resource-add-business-id-mutually-inclusive runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND constraint_name = 'check_technical_resource_business_id_mutually_inclusive'
ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_business_id_mutually_inclusive
CHECK ((business_id IS NULL) = (business_id_type IS NULL));

-- changeset flex:technical-resource-add-additional-information runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND column_name = 'additional_information'
ALTER TABLE flex.technical_resource
ADD COLUMN additional_information text;

ALTER TABLE flex.technical_resource_history
ADD COLUMN additional_information text;

-- changeset flex:technical-resource-drop-details runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns
--  WHERE table_schema = 'flex' AND table_name = 'technical_resource'
--  AND column_name = 'details'
ALTER TABLE flex.technical_resource
DROP COLUMN IF EXISTS details;

ALTER TABLE flex.technical_resource_history
DROP COLUMN IF EXISTS details;

-- changeset flex:technical-resource-device-type-check-constraint runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND constraint_name = 'check_technical_resource_device_type'
ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_device_type
CHECK (device_type IN (
    'inverter', 'boiler', 'water_heater', 'socket',
    'hvac', 'ev_charging_device', 'energy_management_system', 'other'
));

-- changeset flex:technical-resource-technology-check-constraint runOnChange:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'flex' AND table_name = 'technical_resource' AND constraint_name = 'check_technical_resource_technology'
ALTER TABLE flex.technical_resource
ADD CONSTRAINT check_technical_resource_technology
CHECK (flex.technology_ids_exists(technology));

-- changeset flex:technical-resource-category-compute-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION technical_resource_category_compute()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    SELECT array_agg(DISTINCT t.category ORDER BY t.category)
    FROM unnest(NEW.technology) tid
    JOIN flex.technology t ON t.id = tid
    INTO NEW.category;

    IF NEW.category IS NULL THEN
        NEW.category := '{}';
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:technical-resource-category-compute-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER technical_resource_category_compute
BEFORE INSERT OR UPDATE OF technology
ON technical_resource
FOR EACH ROW
EXECUTE FUNCTION technical_resource_category_compute();

-- changeset flex:technical-resource-grid-validation-status-reset-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER technical_resource_grid_validation_status_reset
BEFORE UPDATE OF
technology,
maximum_active_power,
device_type,
make,
model,
business_id,
business_id_type
ON technical_resource
FOR EACH ROW
WHEN (
    (
        old.technology IS DISTINCT FROM new.technology
        OR old.maximum_active_power IS DISTINCT FROM new.maximum_active_power
        OR old.device_type IS DISTINCT FROM new.device_type
        OR old.make IS DISTINCT FROM new.make
        OR old.model IS DISTINCT FROM new.model
        OR old.business_id IS DISTINCT FROM new.business_id
        OR old.business_id_type IS DISTINCT FROM new.business_id_type
    )
    AND current_user = 'flex_service_provider' -- noqa
)
EXECUTE FUNCTION technical_resource_grid_validation_status_reset();
