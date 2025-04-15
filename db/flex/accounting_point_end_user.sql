-- relation linking accounting points to their end user
CREATE TABLE IF NOT EXISTS accounting_point_end_user (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    accounting_point_id bigint NOT NULL,
    end_user_id bigint NOT NULL,
    end_user_party_type text GENERATED ALWAYS AS (
        'end_user'
    ) STORED,
    valid_time_range tstzrange CHECK (
        valid_time_range IS null OR (
            lower(valid_time_range) IS NOT null
            AND lower_inc(valid_time_range)
            AND NOT upper_inc(valid_time_range)
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_accounting_point_end_user_accounting_point FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id),
    CONSTRAINT fk_accounting_point_end_user_end_user FOREIGN KEY (
        end_user_id, end_user_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT accounting_point_end_user_valid_time_overlap
    EXCLUDE USING gist (
        accounting_point_id WITH =, valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

CREATE OR REPLACE TRIGGER accounting_point_end_user_timeline_midnight_aligned
AFTER INSERT OR UPDATE ON accounting_point_end_user
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();

CREATE OR REPLACE FUNCTION
accounting_point_end_user_update_check_for_implicit_cusp_revocation()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_event_data jsonb :=
        jsonb_build_object(
            'termination_date',
                timeline.timestamptz_to_text(upper(NEW.valid_time_range))
        );
    l_cusp_id bigint;
BEGIN
    FOR l_cusp_id IN (
        -- infinite CUSPs behind the AP where the end user was terminated
        SELECT cusp.id AS cusp_id
        FROM flex.controllable_unit_service_provider AS cusp
            INNER JOIN flex.controllable_unit AS cu
                ON cusp.controllable_unit_id = cu.id
            INNER JOIN flex.accounting_point AS ap
                ON cu.accounting_point_id = ap.business_id
        WHERE ap.id = OLD.accounting_point_id
        AND upper(cusp.valid_time_range) IS null
    )
    LOOP
        INSERT INTO flex.event (
            type,
            source,
            data
        ) VALUES (
            text2ltree('no.elhub.flex.controllable_unit_service_provider.implicit_termination'),
            '/controllable_unit_service_provider/' || l_cusp_id,
            l_event_data
        );
    END LOOP;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER
accounting_point_end_user_update_check_for_implicit_cusp_revocation
AFTER UPDATE ON accounting_point_end_user
FOR EACH ROW
WHEN (
    -- end user relation is terminated
    upper(old.valid_time_range) IS null
    AND upper(new.valid_time_range) IS NOT null
)
EXECUTE FUNCTION
accounting_point_end_user_update_check_for_implicit_cusp_revocation();
