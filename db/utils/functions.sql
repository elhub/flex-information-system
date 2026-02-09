--liquibase formatted sql
-- Manually managed file

-- changeset flex:utils-validate-business-id endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION utils.validate_business_id(
    business_id text, business_id_type text
)
RETURNS boolean
SECURITY DEFINER AS $$
BEGIN
    IF business_id is null THEN
        RETURN false;
    END IF;

    IF business_id_type = 'eic_x' THEN
        IF business_id !~ '^[0-9]{2}X[0-9A-Z-]{12}[0-9A-Z]$' THEN
            RETURN false;
        END IF;

        RETURN (
            eic.validate_check_char(business_id)
        );
    ELSIF business_id_type = 'eic_y' THEN
        IF business_id !~ '^[0-9]{2}Y[0-9A-Z-]{12}[0-9A-Z]$' THEN
            RETURN false;
        END IF;

        RETURN (
            eic.validate_check_char(business_id)
        );
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
