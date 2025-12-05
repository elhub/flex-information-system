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
    id bigint;
    operation text;
    event_data jsonb;
BEGIN
    IF TG_OP = 'DELETE' THEN
        id := OLD.id;
    ELSE
        id := NEW.id;
    END IF;

    event_data := null;
    IF TG_OP = 'UPDATE' THEN
        SELECT (
            '{"updated_fields": ' || to_jsonb(array_agg(pre.key))::text || '}'
        )::jsonb
        INTO event_data
        -- fields that changed from OLD to NEW
        FROM jsonb_each(to_jsonb(OLD)) AS pre
        CROSS JOIN jsonb_each(to_jsonb(NEW)) AS post
        WHERE pre.key = post.key
        AND pre.value IS DISTINCT FROM post.value
        -- excluding audit fields because otherwise they will show up everywhere
        AND pre.key NOT IN ('record_time_range', 'recorded_by');
    END IF;

    operation := lower(TG_OP);
    IF operation = 'insert' THEN
        operation := 'create';
    END IF;

    INSERT INTO flex.event (
        type,
        source_resource,
        source_id,
        data
    ) VALUES (
        public.text2ltree('no.elhub.flex.' || TG_ARGV[0] || '.' || operation),
        TG_ARGV[0],
        id,
        event_data
    );

    RETURN NULL;
END;
$$;
