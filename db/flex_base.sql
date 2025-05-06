--
--- Utilities / extensions
--
-- public
SET search_path TO flex, public;

\i pg_audit/pg_audit.sql
GRANT USAGE ON SCHEMA audit TO flex_anonymous;

\i pg_timeline/pg_timeline.sql
GRANT USAGE ON SCHEMA timeline TO flex_anonymous;

\i pg_gs1/pg_gs1.sql
GRANT USAGE ON SCHEMA gs1 TO flex_anonymous;

\i pg_eic/pg_eic.sql
GRANT USAGE ON SCHEMA eic TO flex_anonymous;

\i pg_status/pg_status.sql
GRANT USAGE ON SCHEMA status TO flex_anonymous;

-- enums
\i flex/business_id_type.sql
