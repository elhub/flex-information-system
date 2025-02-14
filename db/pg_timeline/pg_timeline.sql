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

DO
$$
BEGIN
  CREATE TYPE time_update AS (
      value_before timestamptz,
      value_after timestamptz
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

-- freeze a 'valid time' timeline before a certain date :
--   no date can be inserted or updated before the limit
CREATE OR REPLACE FUNCTION timeline_freeze()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    -- interval allowed back in time
    tl_freeze_interval text := TG_ARGV[0];
    -- time field updates
    tl_time_updates time_update[] := ARRAY[]::time_update[];
    tl_update time_update;
BEGIN
    IF TG_OP = 'INSERT' THEN
        tl_time_updates := ARRAY[
            (null, lower(NEW.valid_time_range)),
            (null, upper(NEW.valid_time_range))
        ]::time_update[];
    ELSIF TG_OP = 'UPDATE' THEN
        tl_time_updates := ARRAY[
            (lower(OLD.valid_time_range), lower(NEW.valid_time_range)),
            (upper(OLD.valid_time_range), upper(NEW.valid_time_range))
        ]::time_update[];
    END IF;

    FOREACH tl_update IN ARRAY tl_time_updates LOOP
        IF
            -- the value is new or changed
            (
                tl_update.value_before IS NULL
                OR tl_update.value_after != tl_update.value_before
            )
            AND
            (
                -- the former value was in the frozen past
                (
                    tl_update.value_before IS NOT NULL
                    AND tl_update.value_before
                            < current_timestamp - tl_freeze_interval::interval
                )
                OR
                -- the new value is in the frozen past
                (
                    tl_update.value_after IS NOT NULL
                    AND tl_update.value_after
                            < current_timestamp - tl_freeze_interval::interval
                )
            )
        THEN
            RAISE sqlstate 'PT400' using
                message = 'Cannot set valid time on contract '
                    || 'more than ' || tl_freeze_interval || ' back in time';
            RETURN null;
        END IF;
        RAISE NOTICE 'ok';
    END LOOP;

    IF TG_OP = 'DELETE' THEN
        RETURN null;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;
