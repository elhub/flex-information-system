-- make room for a new record in the timeline
CREATE OR REPLACE FUNCTION timeline_make_room(
    -- table that contains the timeline
    tl_table text,
    -- column that identifies the timeline
    tl_column text,
    -- the new record
    tl_new record
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tl_new_range tstzrange := tstzrange(tl_new.valid_from, tl_new.valid_to, '[)');

    l_rec record;
    l_sql text;
BEGIN

    l_sql = format(
            $s$
            SELECT
                id,
                valid_time_range as old_range
            FROM
                %1$s
            WHERE
                id IS DISTINCT FROM $1.id
                AND %2$s = $1.%2$s
                AND $2 && valid_time_range FOR UPDATE
            $s$, tl_table, tl_column
    );

    RAISE DEBUG '%', l_sql;

    for l_rec in
        EXECUTE l_sql using tl_new, tl_new_range
    loop

        -- @> = contains
        if tl_new_range @> l_rec.old_range then
            EXECUTE format('DELETE FROM %s WHERE id = $1', tl_table) USING l_rec.id;
            continue;
        end if;

        EXECUTE format('UPDATE %s SET
            valid_time_range = $1
        WHERE id = $2', tl_table) USING
            -- Using multiranges since new range might be contained by old range.
            -- If so, the result will be two disjoint sub-ranges.
            -- Difference on regular ranges will fail in these cases.
            (select unnest(multirange(l_rec.old_range) - multirange(tl_new_range)) limit 1),
            l_rec.id;

    end loop;
END;
$$;

CREATE OR REPLACE FUNCTION timeline_no_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    -- the table that contains the actual timeline
    tl_table text;
    -- the view the trigger is on
    tl_view text;
    -- the column that allows us to identify timeline id
    tl_id_column text;
    -- columns that should be inserted/updated. Comma separated
    -- should not include the id column
    tl_columns text;
    -- the new range
    tl_new_range tstzrange;


    l_rec record;
    l_new record;
    l_sql text;

BEGIN

    tl_table = TG_ARGV[0];
    tl_view = TG_TABLE_NAME;
    tl_id_column = TG_ARGV[1];
    tl_columns = TG_ARGV[2];

    tl_new_range = tstzrange(NEW.valid_from, NEW.valid_to, '[)');

    PERFORM timeline_make_room(tl_table, tl_id_column, NEW);

    if TG_OP = 'INSERT' then

        l_sql = format(
            $i$
            INSERT INTO %1$s (
                %2$s,
                %3$s,
                valid_time_range
            ) VALUES (
                $1.%2$s,
                $1.%4$s,
                $2
            ) RETURNING *
            $i$, tl_table, tl_id_column, tl_columns, replace(tl_columns,',',',$1.')
        );

        RAISE DEBUG '%', l_sql;

        EXECUTE l_sql INTO l_new USING NEW, tl_new_range;

    elsif TG_OP = 'UPDATE' then
        l_sql := format(
            $u$
            UPDATE %1$s
            SET (
                %2$s,
                %3$s,
                valid_time_range
            ) = ( VALUES (
                    $1.%2$s,
                    $1.%4$s,
                    $2
            ) )
            WHERE id = $1.id
            RETURNING *
            $u$, tl_table, tl_id_column,tl_columns, replace(tl_columns,',',',$1.')
        );

        RAISE DEBUG '%', l_sql;

        EXECUTE l_sql INTO l_new USING NEW, tl_new_range;
    end if;

    EXECUTE format('SELECT * FROM %s WHERE id = %s', tl_view, l_new.id) INTO l_new;

    RETURN l_new;
END;
$$;

CREATE OR REPLACE FUNCTION timeline_no_check()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    -- the table that contains the actual timeline
    tl_table text;
    -- the view the trigger is on
    tl_view text;
    -- columns that should be inserted/updated. Comma separated
    tl_columns text;
    -- the new range
    tl_new_range tstzrange;

    l_sql text;
    l_new record;
BEGIN
    tl_table = TG_ARGV[0];
    tl_view = TG_TABLE_NAME;
    tl_columns = TG_ARGV[1];

    tl_new_range = tstzrange(NEW.valid_from, NEW.valid_to, '[)');

    if TG_OP = 'INSERT' then
        l_sql = format(
            $i$
            INSERT INTO %1$s (
                %2$s,
                valid_time_range
            ) VALUES (
                $1.%3$s,
                $2
            ) RETURNING *
            $i$, tl_table, tl_columns, replace(tl_columns,',',',$1.')
        );

        RAISE DEBUG '%', l_sql;

        EXECUTE l_sql INTO l_new USING NEW, tl_new_range;

    elsif TG_OP = 'UPDATE' then
        l_sql := format(
            $u$
            UPDATE %1$s
            SET (
                %2$s,
                valid_time_range
            ) = ( VALUES (
                $1.%3$s,
                $2
            ) )
            WHERE id = $1.id
            RETURNING *
            $u$, tl_table, tl_columns, replace(tl_columns,',',',$1.')
        );

        RAISE DEBUG '%', l_sql;

        EXECUTE l_sql INTO l_new USING NEW, tl_new_range;
    end if;

    EXECUTE format('SELECT * FROM %s WHERE id = %s', tl_view, l_new.id) INTO l_new;

    RETURN l_new;
END;
$$;

CREATE OR REPLACE FUNCTION timeline_timestamptz_to_text(t timestamptz)
RETURNS text
SECURITY INVOKER
LANGUAGE sql
AS $$ SELECT
    coalesce(
        to_char(
            t at time zone 'Europe/Oslo',
            'YYYY-MM-DD HH24:MI:SS "Europe/Oslo"'
        ),
        '--'
    )
$$;

-- freeze a 'valid time' timeline before a certain date :
--   no date can be inserted or updated before the limit
-- (limit aligned to the nearest previous midnight in the Norwegian timezone)
CREATE OR REPLACE FUNCTION timeline_freeze()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    -- interval allowed back in time
    tl_freeze_after_interval text := TG_ARGV[0];
    -- time when the freeze is applied
    tl_freeze_time timestamptz := date_trunc(
        'day',
        current_timestamp - tl_freeze_after_interval::interval,
        'Europe/Oslo'
    );
    -- time field update
    tl_update record;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- new record must not be in the frozen past
        IF lower(NEW.valid_time_range) < tl_freeze_time
        THEN
            RAISE sqlstate 'PT400' using
                message = 'Cannot create new contract more than '
                    || tl_freeze_after_interval || ' back in time',
                detail = 'Valid time is frozen before '
                    || timeline_timestamptz_to_text(tl_freeze_time);
            RETURN null;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        FOR tl_update IN
            SELECT
                lower(OLD.valid_time_range) as value_before,
                lower(NEW.valid_time_range) as value_after
            UNION ALL SELECT
                upper(OLD.valid_time_range) as value_before,
                upper(NEW.valid_time_range) as value_after
        LOOP
            IF (
                -- the value is new or changed
                tl_update.value_before IS NULL
                OR tl_update.value_after != tl_update.value_before
            ) THEN
                -- the old value must not be in the frozen past
                IF (
                    tl_update.value_before IS NOT NULL
                    AND tl_update.value_before < tl_freeze_time
                ) THEN
                    RAISE sqlstate 'PT400' using
                        message = 'Cannot update valid time on a contract '
                            || 'more than ' || tl_freeze_after_interval
                            || ' old',
                        detail = 'Valid time is frozen before '
                            || timeline_timestamptz_to_text(tl_freeze_time);
                    RETURN null;
                END IF;

                -- the new value must not be in the frozen past
                IF (
                    tl_update.value_after IS NOT NULL
                    AND tl_update.value_after < tl_freeze_time
                ) THEN
                    RAISE sqlstate 'PT400' using
                        message = 'Cannot set new valid time on contract '
                            || 'more than ' || tl_freeze_after_interval
                            || ' back in time',
                        detail = 'Valid time is frozen before '
                            || timeline_timestamptz_to_text(tl_freeze_time);
                    RETURN null;
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN null;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION timeline_midnight_aligned()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    -- the timestamp to check
    tl_timestamp timestamptz;
BEGIN
    FOREACH tl_timestamp IN ARRAY
        ARRAY[lower(NEW.valid_time_range), upper(NEW.valid_time_range)]
    LOOP
        CONTINUE WHEN tl_timestamp IS NULL;
        IF tl_timestamp != date_trunc('day', tl_timestamp, 'Europe/Oslo') THEN
            RAISE sqlstate 'PT400' using
                message = 'Valid time is not midnight-aligned';
            RETURN null;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- set a window for new entries in the 'valid time' timeline :
--   a contract can neither be created too short or too long in advance
--   (i.e., only after a first interval has passed and during a second interval)
-- the window is :
--   - midnight-aligned in the Norwegian timezone
--   - inclusive at the start, exclusive at the end
CREATE OR REPLACE FUNCTION timeline_valid_start_window()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    -- using start + duration ensures the end of the window is after its start
    tl_window_start_after_interval text := TG_ARGV[0];
    tl_window_interval text := TG_ARGV[1];

    -- window bounds
    tl_window_start timestamptz := date_trunc(
        'day',
        current_timestamp + tl_window_start_after_interval::interval,
        'Europe/Oslo'
    );
    tl_window_end timestamptz := date_trunc(
        'day',
        tl_window_start + tl_window_interval::interval,
        'Europe/Oslo'
    );
BEGIN
    IF NOT lower(NEW.valid_time_range) >= tl_window_start THEN
        RAISE sqlstate 'PT400' using
            message = 'Cannot create new contract '
                || 'less than ' || tl_window_start_after_interval
                || ' ahead of time',
            detail = 'Valid time window starts on '
                || timeline_timestamptz_to_text(tl_window_start);
        RETURN null;
    END IF;

    IF NOT lower(NEW.valid_time_range) < tl_window_end THEN
        RAISE sqlstate 'PT400' using
            message = 'Cannot create new contract more than '
                || justify_interval(
                       tl_window_start_after_interval::interval +
                       tl_window_interval::interval
                   )::text
                || ' ahead of time',
            detail = 'Valid time window lasts until '
                || timeline_timestamptz_to_text(tl_window_end) || ' (excluded)';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;
