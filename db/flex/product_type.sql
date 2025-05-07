--liquibase formatted sql
-- Manually managed file

-- changeset flex:product-type-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS product_type (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id text NOT NULL UNIQUE CHECK (
        char_length(business_id) <= 64
    ),
    category text NOT NULL CHECK (
        char_length(category) <= 64
    ),
    market text NOT NULL CHECK (
        char_length(market) <= 64
    ),
    market_type text NOT NULL CHECK (
        char_length(market_type) <= 64
    ),
    examples text NULL CHECK (
        char_length(examples) <= 128
    ),
    notes text NULL CHECK (
        char_length(notes) <= 1024
    )
);

-- changeset flex:product-type-ids-exists runOnChange:false endDelimiter:--
-- foreign key check but for an array
CREATE OR REPLACE FUNCTION product_type_ids_exists(
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
