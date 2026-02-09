--liquibase formatted sql
-- Manually managed file

-- changeset flex:business-id-type-create endDelimiter:--
CREATE TABLE IF NOT EXISTS flex.business_id_type (
    name text PRIMARY KEY,
    description text NULL,
    CONSTRAINT check_business_id_type_name_length CHECK (
        (char_length(name) <= 32)
    )
);

-- changeset flex:validate-business-id-drop runOnChange:true endDelimiter:;
DROP FUNCTION IF EXISTS flex.validate_business_id CASCADE;
