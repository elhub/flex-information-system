ALTER TABLE IF EXISTS product_type ENABLE ROW LEVEL SECURITY;

-- RLS: PT-COM001
GRANT SELECT ON product_type TO flex_common;
CREATE POLICY "PT_COM001" ON product_type
FOR SELECT
TO flex_common
USING (true);
