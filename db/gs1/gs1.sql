-- compute the last digit (check digit) of a GS1 prefix
CREATE OR REPLACE FUNCTION compute_check_digit(partial_gs1 text)
RETURNS integer AS $$
DECLARE
    multiplier integer := 3;
    sum        integer := 0;
BEGIN
    for i in reverse char_length(partial_gs1) .. 1 loop
        sum := sum + substring(partial_gs1 from i for 1)::integer * multiplier;
        if multiplier = 3 then multiplier := 1; else multiplier := 3; end if;
    end loop;
    return mod(10 - mod(sum, 10), 10);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- compute and add the check digit to a GS1 prefix to form a full GS1 identifier
CREATE OR REPLACE FUNCTION add_check_digit(partial_gs1 text)
RETURNS text AS $$
BEGIN
    return partial_gs1 || compute_check_digit(partial_gs1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- validate a GS1 identifier
CREATE OR REPLACE FUNCTION validate_check_digit(gs1 text)
RETURNS boolean
SECURITY DEFINER
AS $$
DECLARE
    partial_gs1 text := left(gs1, -1);
BEGIN
    return (right(gs1, 1)::integer = compute_check_digit(partial_gs1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
