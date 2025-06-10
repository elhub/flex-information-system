--liquibase formatted sql
-- Manually managed file

-- changeset flex:cusp-add-end-user runOnChange:false endDelimiter:;
--validCheckSum: 9:9ef9e5e878fc6955632e944e5692d295
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'controllable_unit_service_provider' AND column_name = 'end_user_id'

-- disable triggers to prevent the system from adding history/event records
ALTER TABLE flex.controllable_unit_service_provider
DISABLE TRIGGER USER;

-- add new columns
ALTER TABLE flex.controllable_unit_service_provider
ADD COLUMN end_user_id bigint;

ALTER TABLE flex.controllable_unit_service_provider
ADD COLUMN end_user_party_type text GENERATED ALWAYS AS ('end_user') STORED;

ALTER TABLE flex.controllable_unit_service_provider_history
ADD COLUMN end_user_id bigint;

-- NB: this should not have been GENERATED because the trigger inserting in
--     history copies all the fields, see next changeset
ALTER TABLE flex.controllable_unit_service_provider_history
ADD COLUMN end_user_party_type text GENERATED ALWAYS AS ('end_user') STORED;

-- for each CUSP, set as end user the last end user associated to the AP in the
-- valid time of the CUSP
-- approximation: for deleted records (no valid time), use the latest registered
--   end user on the AP
UPDATE flex.controllable_unit_service_provider AS cusp
SET
    end_user_id = (
        SELECT apeu.end_user_id
        FROM flex.controllable_unit AS cu
            INNER JOIN flex.accounting_point_end_user AS apeu
                ON cu.accounting_point_id = apeu.accounting_point_id
        WHERE cu.id = cusp.controllable_unit_id
            AND coalesce(apeu.valid_time_range && cusp.valid_time_range, true)
        ORDER BY lower(apeu.valid_time_range) DESC
        LIMIT 1
    );

-- approximation: use the same value in history
UPDATE flex.controllable_unit_service_provider_history AS cusph
SET
    end_user_id = (
        SELECT cusp.end_user_id
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.id = cusph.id
    );

-- make the new field a non-null foreign key once it is filled for all entries
ALTER TABLE flex.controllable_unit_service_provider
ALTER COLUMN end_user_id SET NOT NULL;

ALTER TABLE flex.controllable_unit_service_provider
ADD CONSTRAINT controllable_unit_service_provider_end_user_fkey
FOREIGN KEY (
    end_user_id, end_user_party_type
) REFERENCES flex.party (id, type);

ALTER TABLE flex.controllable_unit_service_provider
ENABLE TRIGGER USER;

-- changeset flex:cusp-correct-end-user-party-type runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:'ALWAYS' SELECT is_generated FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'controllable_unit_service_provider_history' AND column_name = 'end_user_party_type';
ALTER TABLE flex.controllable_unit_service_provider_history
ALTER COLUMN end_user_party_type DROP EXPRESSION;
