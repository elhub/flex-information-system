--liquibase formatted sql
-- Manually managed file

-- changeset flex:energy-supplier-balance-responsibility-remove-id runAlways:true endDelimiter:;
ALTER TABLE flex.energy_supplier_balance_responsibility
DROP COLUMN IF EXISTS id;
DROP INDEX IF EXISTS energy_supplier_balance_responsibility_history_id_idx;
