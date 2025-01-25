CREATE OR REPLACE FUNCTION status_insert()
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

CREATE OR REPLACE FUNCTION status_update()
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
