--liquibase formatted sql

-- changeset flex:utils-create-schema
CREATE SCHEMA IF NOT EXISTS utils;

-- changeset flex:utils-raise-sqlstate runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION utils.raise_sqlstate()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    RAISE sqlstate 'PT400'
    USING
      message = TG_ARGV[0];
    RETURN null;
END;
$$;

-- changeset flex:utils-create-role-exists runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
utils.role_exists() RETURNS trigger AS $$
begin
  if not exists (select 1 from pg_roles as r where r.rolname = new.role) then
    raise foreign_key_violation using message =
      'unknown database role: ' || new.role;
    return null;
  end if;
  return new;
end
$$ LANGUAGE plpgsql;

-- changeset flex:utils-check-timestamp-on-status-update runOnChange:true endDelimiter:--
-- this trigger checks a given timestamp field in the updated record depending
-- on the value of a given status field in the same record:
-- some status values make the timestamp required, others require it to be unset
CREATE OR REPLACE FUNCTION utils.check_timestamp_on_status_update()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    -- name of the timestamp field that must be checked against the new status
    in_timestamp_field_name text := TG_ARGV[0];
    -- name of the status field
    in_status_field_name text := TG_ARGV[1];

    -- values for status for which the timestamp is expected
    in_statuses_timestamp_expected text[] := TG_ARGV[2]::text[];
    -- values for status for which the timestamp must be deleted
    in_statuses_timestamp_refused text[] := TG_ARGV[3]::text[];

    l_status text;
    l_timestamp timestamp with time zone;
BEGIN
    EXECUTE format(
        'SELECT $1.%s, $1.%s',
        in_status_field_name, in_timestamp_field_name
    )
    INTO l_status, l_timestamp
    USING NEW;

    IF l_status = ANY(in_statuses_timestamp_expected)
        AND l_timestamp IS NULL
    THEN
        RAISE sqlstate 'PT400'
        USING
            message = format(
                '%s timestamp must be set when %s is set to %s',
                in_timestamp_field_name,
                in_status_field_name,
                l_status
            );
    ELSIF l_status = ANY(in_statuses_timestamp_refused)
        AND l_timestamp IS NOT NULL
    THEN
        RAISE sqlstate 'PT400'
        USING
            message = format(
                '%s timestamp must be removed when %s is set to %s',
                in_timestamp_field_name,
                in_status_field_name,
                l_status
            );
    END IF;

    RETURN NEW;
END;
$$;
