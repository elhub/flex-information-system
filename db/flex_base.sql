--
--- Utilities / extensions
--
-- public
SET search_path TO flex, public;

\i pg_audit/pg_audit.sql
GRANT USAGE ON SCHEMA audit TO flex_anonymous;

\i pg_timeline/pg_timeline.sql
GRANT USAGE ON SCHEMA timeline TO flex_anonymous;

\i gs1/gs1.sql
GRANT USAGE ON SCHEMA gs1 TO flex_anonymous;



--
---- Business Identifier Type
--

CREATE TABLE IF NOT EXISTS business_id_type (
    name text PRIMARY KEY,
    description text NULL,
    CONSTRAINT check_business_id_type_name_length CHECK (
        (char_length(name) <= 32)
    )
);

CREATE OR REPLACE FUNCTION validate_business_id(
    business_id text, business_id_type text
)
RETURNS boolean
SECURITY DEFINER AS $$
BEGIN
    IF business_id is null THEN
        RETURN false;
    END IF;

    IF business_id_type = 'eic_x' THEN
        -- TODO: include an EIC check character validation function
        RETURN (business_id ~ '^[0-9]{2}X[0-9A-Z-]{12}[0-9A-Z]$');
    ELSIF business_id_type = 'uuid' THEN
        RETURN (
            business_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        );
    ELSIF business_id_type = 'gln' THEN
        IF business_id !~ '^[1-9][0-9]{12}$' THEN
            RETURN false;
        END IF;

        RETURN (
            gs1.validate_check_digit(business_id)
        );
    ELSIF business_id_type = 'gsrn' THEN
        -- GSRN validation:
        --   the business_id is a 18-digit number and its check digit is correct
        IF business_id !~ '^[1-9][0-9]{17}$' THEN
            RETURN false;
        END IF;

        RETURN (
            gs1.validate_check_digit(business_id)
        );
    ELSIF business_id_type = 'email' THEN
        -- Email validation: check if business_id is a valid email address
        RETURN (business_id ~ '^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$');
    ELSIF business_id_type = 'pid' THEN
        -- PID validation: check if business_id is a valid personal identification number
        RETURN (business_id ~ '^[1-9][0-9]{10}$');
    ELSIF business_id_type = 'org' THEN
        -- Validate organisation number
        RETURN (business_id ~ '^[1-9][0-9]{8}$');
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
