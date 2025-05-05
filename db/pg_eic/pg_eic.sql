--liquibase formatted sql

-- changeset flex:eic-create-schema
CREATE SCHEMA IF NOT EXISTS eic;

-- changeset flex:eic-char-to-code runOnChange:true endDelimiter:--
-- convert a character to its EIC numeric value
CREATE OR REPLACE FUNCTION eic.char_to_code(c text)
RETURNS integer AS $$
BEGIN
    IF c ~ '^[0-9]$' THEN
        RETURN c::integer;
    ELSIF c ~ '^[A-Z]$' THEN
        RETURN ascii(c) - ascii('A') + 10;
    ELSIF c = '-' THEN
        RETURN 36;
    ELSE
        RAISE EXCEPTION 'EIC char to code: invalid character %', c;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- changeset flex:eic-code-to-char runOnChange:true endDelimiter:--
-- convert an EIC numeric value to a character
CREATE OR REPLACE FUNCTION eic.code_to_char(code integer)
RETURNS text AS $$
BEGIN
    IF code BETWEEN 0 AND 9 THEN
        RETURN code::text;
    ELSIF code BETWEEN 10 AND 35 THEN
        RETURN chr(code + ascii('A') - 10);
    ELSIF code = 36 THEN
        RETURN '-';
    ELSE
        RAISE EXCEPTION 'EIC code to char: invalid code %', code;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- changeset flex:eic-compute-check-char runOnChange:true endDelimiter:--
-- compute the check character of an EIC prefix
CREATE OR REPLACE FUNCTION eic.compute_check_char(partial_eic text)
RETURNS text AS $$
DECLARE
    sum        integer := 0;
    weight     integer := 16;
BEGIN
    IF char_length(partial_eic) != 15 THEN
        RAISE EXCEPTION 'EIC compute check digit: invalid prefix length';
    END IF;

    FOR i IN 1..15 LOOP
        sum :=
            sum +
            weight * eic.char_to_code(substring(partial_eic FROM i FOR 1));
        weight := weight - 1;
    END LOOP;

    RETURN eic.code_to_char(36 - ((sum - 1) % 37));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- changeset flex:eic-add-check-char runOnChange:true endDelimiter:--
-- compute and add the check character to an EIC prefix to form a full EIC
-- identifier
CREATE OR REPLACE FUNCTION eic.add_check_char(partial_eic text)
RETURNS text AS $$
BEGIN
    RETURN partial_eic || eic.compute_check_char(partial_eic);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- changeset flex:eic-validate-check-char runOnChange:true endDelimiter:--
-- validate an EIC identifier
CREATE OR REPLACE FUNCTION eic.validate_check_char(eic text)
RETURNS boolean
SECURITY DEFINER
AS $$
DECLARE
    partial_eic text := left(eic, -1);
BEGIN
    RETURN (right(eic, 1) = eic.compute_check_char(partial_eic));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
