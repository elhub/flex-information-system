--liquibase formatted sql
-- Manually managed file

-- changeset flex:scope-allowed-constraint runOnChange:true endDelimiter:;
-- Enforce the accepted set of scopes on the flex.scope domain by delegating to
-- flex.scope_allowed() (generated in scope_allowed.sql). Because the constraint
-- only references the function, the accepted scopes can be changed afterwards by
-- replacing that function alone -- this constraint, the domain, the tables using
-- flex.scope[] and everything depending on them are never touched again.
--
-- This changeset is idempotent (drop-then-add) so it can be re-run safely:
--   * check_scope was the previous hardcoded IN-list constraint, present only on
--     environments where the older scope migration had already run;
--   * the DROP CONSTRAINT IF EXISTS statements can be removed once this has run
--     in every environment.
-- NOT VALID skips the scan of existing rows (they already satisfy the list) and,
-- unlike changing a column type, adding a domain constraint does not require
-- dropping the dependent views/grants.
ALTER DOMAIN flex.scope DROP CONSTRAINT IF EXISTS check_scope;
ALTER DOMAIN flex.scope DROP CONSTRAINT IF EXISTS check_scope_allowed;
ALTER DOMAIN flex.scope
ADD CONSTRAINT check_scope_allowed CHECK (flex.scope_allowed(value)) NOT VALID;
