--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-rename-prequalified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_grid_prequalification' AND column_name = 'last_prequalified'
ALTER TABLE flex.service_providing_group_grid_prequalification
RENAME COLUMN last_prequalified TO prequalified_at;
