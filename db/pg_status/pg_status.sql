--liquibase formatted sql

-- changeset flex:gs1-create-schema
CREATE SCHEMA IF NOT EXISTS status;

-- changeset flex:status-restrict-insert runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION status.restrict_insert()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    initial_value text := TG_ARGV[0];
BEGIN
    IF NEW.status != initial_value THEN
        RAISE sqlstate 'PT400' using
            message = 'status must have '
                      || initial_value
                      || ' as an initial value';
        RETURN null;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- changeset flex:status-restrict-update runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION status.restrict_update()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    initial_value text := TG_ARGV[0];
BEGIN
    IF NEW.status = initial_value THEN
        RAISE sqlstate 'PT400' using
            message = 'status cannot transition back to ' || initial_value;
        RETURN null;
    END IF;

    IF OLD.status = 'terminated'
    AND current_role != 'flex_flexibility_information_system_operator' THEN
        RAISE sqlstate 'PT400' using
            message = 'this user cannot put this resource back into activity';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;
