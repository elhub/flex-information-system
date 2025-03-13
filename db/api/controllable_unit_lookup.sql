CREATE OR REPLACE FUNCTION controllable_unit_lookup(
    l_end_user_business_id text,
    l_controllable_unit_business_id text,
    l_accounting_point_id text
)
RETURNS TABLE (
    id bigint,
    business_id text,
    name text,
    accounting_point_id text,
    end_user_id bigint,
    technical_resources jsonb
)
SECURITY INVOKER
LANGUAGE sql
AS $$
    SELECT flex.controllable_unit_lookup(
        l_end_user_business_id,
        l_controllable_unit_business_id,
        l_accounting_point_id
    );
$$;
