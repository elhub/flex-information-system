--liquibase formatted sql
-- Manually managed file

-- changeset flex:technology-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS flex.technology (
    id text PRIMARY KEY,
    category text NOT NULL,
    name text NOT NULL,
    CONSTRAINT check_technology_category CHECK (
        category IN ('production', 'energy_storage', 'consumption')
    )
);

-- changeset flex:technology-ids-exists runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION flex.technology_ids_exists(
    technology_ids text []
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
    SELECT NOT EXISTS (
        SELECT tid FROM unnest(technology_ids) tid -- noqa
        WHERE NOT EXISTS (
            SELECT 1 FROM flex.technology WHERE id = tid
        )
    )
$$;
