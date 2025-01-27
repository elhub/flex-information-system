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
