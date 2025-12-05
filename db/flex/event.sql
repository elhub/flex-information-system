--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-create runOnChange:false endDelimiter:--
--validCheckSum: 9:526c626b33806895131a9e3537b5b1d6
CREATE TABLE IF NOT EXISTS event (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    -- reverse DNS style identifier
    -- (ltree makes it faster to filter on this field in the queries,
    -- because it looks like a path)
    type ltree NOT NULL CHECK (
        type ~ 'no.elhub.flex.*'
    ),
    source_resource text NOT NULL,
    source_id bigint NOT NULL,
    subject_resource text NULL,
    subject_id bigint NULL,
    data jsonb NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity()
);

-- changeset flex:event-capture runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION capture_event()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    -- source of the event
    l_source text;
    l_src_id bigint;
    -- subject of the event
    l_subject text;
    l_sub_id bigint;
    -- event details
    l_operation text;
    l_event_data jsonb;
    -- local variables
    l_id bigint;
BEGIN
    IF TG_OP = 'DELETE' THEN
        l_id := OLD.id;
    ELSE
        l_id := NEW.id;
    END IF;

    IF TG_NARGS = 0 THEN
        -- event without subject
        l_source := TG_TABLE_NAME;
        l_src_id := l_id;
        l_subject := null;
        l_sub_id := null;
    ELSE
        -- the impacted table is the subject, the given table is the source
        l_source := TG_ARGV[0];
        IF TG_OP = 'DELETE' THEN
            l_src_id := (to_jsonb(OLD)->>(l_source || '_id'))::bigint;
        ELSE
            l_src_id := (to_jsonb(NEW)->>(l_source || '_id'))::bigint;
        END IF;
        l_subject := TG_TABLE_NAME;
        l_sub_id := l_id;
    END IF;

    l_event_data := null;
    IF TG_OP = 'UPDATE' THEN
        SELECT (
            '{"updated_fields": ' || to_jsonb(array_agg(pre.key))::text || '}'
        )::jsonb
        INTO l_event_data
        -- fields that changed from OLD to NEW
        FROM jsonb_each(to_jsonb(OLD)) AS pre
        CROSS JOIN jsonb_each(to_jsonb(NEW)) AS post
        WHERE pre.key = post.key
        AND pre.value IS DISTINCT FROM post.value
        -- excluding audit fields because otherwise they will show up everywhere
        AND pre.key NOT IN ('record_time_range', 'recorded_by');
    END IF;

    l_operation := lower(TG_OP);
    IF l_operation = 'insert' THEN
        l_operation := 'create';
    END IF;

    INSERT INTO flex.event (
        type,
        source_resource,
        source_id,
        subject_resource,
        subject_id,
        data
    ) VALUES (
        public.text2ltree(
            'no.elhub.flex.' || TG_TABLE_NAME || '.' || l_operation
        ),
        l_source,
        l_src_id,
        l_subject,
        l_sub_id,
        l_event_data
    );

    RETURN NULL;
END;
$$;
