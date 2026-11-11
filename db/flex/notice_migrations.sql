--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-remove-legacy-cu-cso-no-active-users runOnChange:false endDelimiter:--
-- The notice was moved from a controllable unit source to a party source with
-- another type. Notices of the old type carry the removed payload kind
-- notice.data.controllable_unit.cso.no_active_users, which is no longer part of
-- the API. notice_sync() would only resolve them and keep the payload exposed,
-- so remove them: the new notice is created by the next synchronisation.
-- The deleted rows are moved to notice_history, which is not exposed in the API.
DO $$
BEGIN
    PERFORM set_config('flex.current_identity', '0', true);
    DELETE FROM flex.notice
    WHERE type = 'no.elhub.flex.controllable_unit.cso.no_active_users'::ltree;
END;
$$;
