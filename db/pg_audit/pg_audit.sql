--liquibase formatted sql

-- changeset flex:audit-crete-schema
CREATE SCHEMA IF NOT EXISTS audit;

-- changeset flex:audit-current runOnChange:true endDelimiter:--
-- This is a before trigger that recorded_by and recorded_at
-- on insert and update.
CREATE OR REPLACE FUNCTION audit.current()
RETURNS TRIGGER AS $$
DECLARE
  -- the name of the function that returns the current identity
  -- the function must return a bigint
  -- must be passed as the first argument to the trigger
  in_identity_function text := TG_ARGV[0];

  -- local variables
  lv_recorded_by bigint := OLD.recorded_by;
  lv_recorded_at timestamptz := lower(OLD.record_time_range);
BEGIN


  -- only change the audit columns if things actually change
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD IS DISTINCT FROM NEW) THEN
    EXECUTE format('SELECT %s()', in_identity_function) INTO lv_recorded_by;
    lv_recorded_at := CURRENT_TIMESTAMP;
  END IF;

  -- we allow overrides on insert in case the system
  -- is creating the record as part of actual users transaction
  IF NOT ( TG_OP = 'INSERT' AND NEW.recorded_by = 0 ) THEN
    NEW.recorded_by = lv_recorded_by;
  END IF;

  NEW.record_time_range = tstzrange(lv_recorded_at, NULL, '[)');

  RETURN NEW;

END;
$$ LANGUAGE plpgsql;

-- changeset flex:audit-history runOnChange:true endDelimiter:--
-- This a after trigger that records the history of the table
-- on update and delete.
CREATE OR REPLACE FUNCTION audit.history()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE


    -- the name of the function that returns the current identity
    -- the function must return a bigint
    -- must be passed as the first argument to the trigger
    in_identity_function text := TG_ARGV[0];

    lv_columns text[];

    lv_replaced_by bigint;

    lv_replaced_at timestamptz := CURRENT_TIMESTAMP;
    lv_recorded_at timestamptz;

    lv_history_table text := quote_ident(TG_TABLE_SCHEMA) || '.' || quote_ident(TG_TABLE_NAME || '_history');
BEGIN

    -- ignore unchanged
    IF TG_OP = 'UPDATE' AND NEW IS NOT DISTINCT FROM OLD THEN
      RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
      -- We must ignore if update has already happened in this transaction
      IF OLD.xmin::text = (txid_current() % (2^32)::bigint)::text THEN
        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;
        RETURN NEW;
      END IF;

      -- mitigate possible conflicts
      EXECUTE 'SELECT lower($1.record_time_range)' USING OLD
      INTO lv_recorded_at;

      IF lv_recorded_at >= lv_replaced_at THEN
        lv_recorded_at := lv_recorded_at + INTERVAL '1 millisecond';
      END IF;

      -- insert into history table
      SELECT array_agg(quote_ident(attname)) into lv_columns
      FROM pg_attribute
      WHERE attrelid = TG_RELID
      AND attnum > 0
      AND NOT attisdropped
      AND attname != 'record_time_range';

      EXECUTE format('SELECT %s()', in_identity_function) INTO lv_replaced_by;

      EXECUTE ('INSERT INTO ' || lv_history_table ||
        '(' || array_to_string(lv_columns,',') || ', record_time_range, replaced_by )
        VALUES ($1.' || array_to_string(lv_columns,',$1.') ||
        ', tstzrange($2, $3, ''[)''),  $4 )')
      USING OLD, lv_recorded_at, lv_replaced_at, lv_replaced_by;

    END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
