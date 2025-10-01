--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-business-id-update-to-eic-y runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'metering_grid_area_business_id_check' AND conbin::text LIKE '%101 105 99 95 120%'
-- (NB: searching for the ASCII codes for "eic_x")
ALTER TABLE flex.metering_grid_area
DISABLE TRIGGER USER;

ALTER TABLE flex.metering_grid_area
DROP CONSTRAINT IF EXISTS
metering_grid_area_business_id_check;

-- change all X to Y in EIC codes for MGAs
UPDATE flex.metering_grid_area
SET
    business_id
    = substring(business_id, 1, 2) || 'Y'
    || substring(business_id, 4, 12) || '-';
-- initially set check digit to '-' (invalid) so it is recomputed


-- The check digit computation can give '-' for some codes, which is invalid.
-- To solve this, we need to change characters in the prefix until a valid code
-- is found. We do it with a terminating loop that replaces a range of
-- characters in the code with 'X' one by one until a valid code is found.
DO
$$
DECLARE
    i bigint;
BEGIN
    FOR i IN REVERSE 15..4 LOOP
        -- recompute check digit on invalid codes
        UPDATE flex.metering_grid_area
        SET business_id = eic.add_check_char(left(business_id, 15))
        WHERE right(business_id, 1) = '-';

        -- change one character on codes that got '-' as check digit again
        UPDATE flex.metering_grid_area
        SET
            business_id
            = left(business_id, i - 1) || 'X' || right(business_id, 16 - i)
        WHERE right(business_id, 1) = '-';

        -- early exit if no invalid codes are left
        EXIT WHEN NOT FOUND;
    END LOOP;
END
$$;

ALTER TABLE flex.metering_grid_area
ADD CONSTRAINT metering_grid_area_business_id_check
CHECK (
    validate_business_id(business_id, 'eic_y')
);

-- update from main table to history will work because MGAs cannot be deleted
UPDATE flex.metering_grid_area_history
SET business_id = (
    SELECT mga.business_id
    FROM flex.metering_grid_area AS mga
    WHERE mga.id = metering_grid_area_history.id
);

ALTER TABLE flex.metering_grid_area
ENABLE TRIGGER USER;
