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
