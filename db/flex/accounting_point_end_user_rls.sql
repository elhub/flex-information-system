-- We shouldn't really need RLS, but keeping the filename consistent with the other tables
GRANT SELECT ON flex.accounting_point_end_user TO flex_common;
