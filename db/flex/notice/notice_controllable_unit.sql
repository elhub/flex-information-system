--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit runAlways:true endDelimiter:--

DROP VIEW IF EXISTS notice_cu_grid_node_id_missing CASCADE;
DROP VIEW IF EXISTS notice_cu_grid_validation_status_pending CASCADE;
DROP VIEW IF EXISTS notice_cu_grid_validation_status_incomplete_information CASCADE;
