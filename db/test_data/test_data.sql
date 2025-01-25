-- test_data contains functions to add test data to the database.

-- Turn an email into a name
-- john.doe@ex.test -> John Doe
CREATE OR REPLACE FUNCTION email_to_name(email text)
RETURNS text
AS $$
BEGIN
  -- error if input does not look like a email ending with .test TLD
  IF email !~ '^[a-z]+\.[a-z]+@[a-z]+.test$' THEN
    RAISE EXCEPTION 'Invalid email: %', email;
  END IF;
  RETURN initcap(replace(split_part(email, '@', 1), '.', ' '));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Randomly return 'up', 'down' or 'both'
CREATE OR REPLACE FUNCTION random_regulation_direction()
RETURNS text
AS $$
BEGIN
  RETURN CASE floor(random() * 3)
    WHEN 0 THEN 'up'
    WHEN 1 THEN 'down'
    ELSE 'both'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add a party for an entity based on name and type
CREATE OR REPLACE FUNCTION add_party_for_entity(
    entity_id bigint,
    party_name text,
    party_type text,
    party_business_id text,
    party_business_id_type text
)
RETURNS bigint
AS $$
DECLARE
  party_id bigint;
BEGIN
  IF party_business_id IS NULL THEN
      INSERT INTO flex.party (name, type, role, status)
      VALUES (party_name, party_type, 'flex_' || party_type, 'active')
      RETURNING id INTO party_id;
  ELSE
      INSERT INTO flex.party (name, type, role, status, business_id, business_id_type)
      VALUES (
          party_name, party_type, 'flex_' || party_type, 'active',
          party_business_id, party_business_id_type
      )
      RETURNING id INTO party_id;
  END IF;

  INSERT INTO flex.party_membership (entity_id, party_id) VALUES (entity_id, party_id);

  RETURN party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- Add a party as a member to an entity based on name of party
CREATE OR REPLACE FUNCTION add_party_to_entity(
    entity_id bigint, party_name text
)
RETURNS bigint
AS $$
DECLARE
  party_id bigint;
BEGIN
  SELECT id INTO party_id FROM flex.party WHERE name = party_name;
  INSERT INTO flex.party_membership (entity_id, party_id) VALUES (entity_id, party_id);
  RETURN party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- Input type for add_controllable_unit
DO
$$
BEGIN
  CREATE TYPE cu_sp AS (
      sp_id bigint,
      valid_time_range tstzrange
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

-- Add a controllable unit with service providers
CREATE OR REPLACE FUNCTION add_controllable_unit(
    cu_name text,
    so_id bigint,
    accounting_point_id text,
    service_providers cu_sp []
)
RETURNS bigint
AS $$
DECLARE
  cu_id bigint;
  sp cu_sp;
BEGIN
  INSERT INTO flex.controllable_unit (
    name,
    start_date,
    regulation_direction,
    maximum_available_capacity,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated
  ) VALUES (
    cu_name,
    '2020-01-01',
    random_regulation_direction(),
    3.5,
    1,
    5,
    10,
    0.5,
    accounting_point_id,
    public.uuid_generate_v4(),
    'validated',
    'pqnotes',
    current_timestamp
  ) RETURNING id INTO cu_id;

  FOREACH sp IN ARRAY service_providers
  LOOP
    INSERT INTO flex.controllable_unit_service_provider (
      controllable_unit_id, service_provider_id, valid_time_range
    ) VALUES (
      cu_id, sp.sp_id, sp.valid_time_range
    );
  END LOOP;

  RETURN cu_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- Add accounting point mapping
CREATE OR REPLACE FUNCTION add_accounting_points(
    accounting_point_prefix text,
    so_id bigint
)
RETURNS void
SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$

  with gsrn as (
      -- This generates a series of GSRNs with the given prefix
      -- By padding the prefix with zeros and nines to 17 digits total we can generate a series
      -- that "fills" the whole prefix.
      -- The the prefix is 1234 we generate GSRNs from 12340000000000000 to 12349999999999999.
      -- The check digit is then added to make the GSRN comlete.
      select generate_series(
        rpad(accounting_point_prefix,17,'0')::bigint,
        rpad(accounting_point_prefix,17,'9')::bigint,
        1 --step
      ) as partial
  )
  insert into flex.accounting_point (
    business_id,
    system_operator_id
  )
  select
    add_check_digit(gsrn.partial::text) as business_id,
    so_id as system_operator_id
  from gsrn

$$;

-- Add a test account with parties and controllable units
DROP FUNCTION IF EXISTS add_test_account;
CREATE OR REPLACE FUNCTION add_test_account(
    in_business_id text,
    email text,
    accounting_point_prefix text,
    party_business_id_prefix text,
    add_fiso boolean,
    add_data boolean,
    common_party_first_name text
) RETURNS void
AS $$
DECLARE
  entity_name text := email_to_name(email);
  entity_first_name text := split_part(entity_name, ' ', 1);

  entity_id bigint;
  sp_id bigint;
  common_sp_id bigint;

  spg_id bigint;
  cu_id bigint;
  so_id bigint;

  asset_type text;
  accounting_point_seq bigint := rpad(accounting_point_prefix, 17, '0')::bigint;
  party_business_id_seq bigint :=
      rpad(party_business_id_prefix, 12, '0')::bigint;
BEGIN
  -- return early if the entity buiness id is already in use
  PERFORM id FROM flex.entity e WHERE e.business_id = in_business_id;
  IF FOUND THEN
    RETURN;
  END IF;

  -- add entity

  INSERT INTO flex.entity (name, type, business_id, business_id_type, client_id)
  VALUES (entity_name, 'person', in_business_id, 'pid', email)
  RETURNING id INTO entity_id;

  -- add parties

  PERFORM add_party_for_entity(
    entity_id,
    entity_first_name || ' BRP',
   'balance_responsible_party',
    add_check_digit(party_business_id_seq::text),
    'gln'
  );

  PERFORM add_party_for_entity(
    entity_id,
    entity_first_name || ' EU',
   'end_user',
   null,
   null
  );

  PERFORM add_party_for_entity(
    entity_id,
    entity_first_name || ' ES',
   'energy_supplier',
    add_check_digit((party_business_id_seq + 2)::text),
    'gln'
  );

  PERFORM add_party_for_entity(
    entity_id,
    entity_first_name || ' MO',
   'market_operator',
    add_check_digit((party_business_id_seq + 3)::text),
    'gln'
  );

  so_id := add_party_for_entity(
    entity_id,
    entity_first_name || ' SO',
   'system_operator',
    add_check_digit((party_business_id_seq + 4)::text),
    'gln'
  );

  sp_id := add_party_for_entity(
    entity_id,
    entity_first_name || ' SP',
   'service_provider',
    add_check_digit((party_business_id_seq + 5)::text),
    'gln'
  );

  PERFORM add_party_for_entity(
    entity_id,
    entity_first_name || ' TP',
   'third_party',
    add_check_digit((party_business_id_seq + 6)::text),
    'gln'
  );

  if add_fiso then
    PERFORM add_party_for_entity(
      entity_id,
      entity_first_name || ' FISO',
      'flexibility_information_system_operator',
      add_check_digit((party_business_id_seq + 7)::text),
      'gln'
    );
  end if;

  -- Add accounting points
  PERFORM add_accounting_points(accounting_point_prefix, so_id);

  -- Product type
  INSERT INTO flex.system_operator_product_type (
    system_operator_id,
    product_type_id
  ) SELECT so_id, id
  FROM flex.product_type pt
  WHERE pt.business_id in ('manual_congestion_activation', 'manual_congestion_capacity');

  if not add_data then
    return;
  end if;

  PERFORM add_party_to_entity(entity_id, common_party_first_name || ' BRP');
  PERFORM add_party_to_entity(entity_id, common_party_first_name || ' EU');
  PERFORM add_party_to_entity(entity_id, common_party_first_name || ' ES');
  PERFORM add_party_to_entity(entity_id, common_party_first_name || ' MO');
  PERFORM add_party_to_entity(entity_id, common_party_first_name || ' SO');
  common_sp_id := add_party_to_entity(entity_id, common_party_first_name || ' SP');
  PERFORM add_party_to_entity(entity_id, common_party_first_name || ' TP');

  INSERT INTO flex.service_providing_group (
    name, service_provider_id
  ) VALUES (
    entity_first_name || ' SPG', sp_id
  ) RETURNING id INTO spg_id;

  FOREACH asset_type in ARRAY ARRAY['Car Charger','Water Heater','Solar Panel']::text[]
  LOOP

    SELECT add_controllable_unit(
      entity_first_name || ' ' || asset_type,
      so_id,
      add_check_digit(accounting_point_seq::text),
      ARRAY[
          (sp_id, '[2024-07-01 09:00:00 CET,2024-08-01 09:00:00 CET)'::tstzrange),
          (common_sp_id, '[2024-08-01 09:00:00 CET,2024-09-01 09:00:00 CET)'::tstzrange),
          (sp_id, '[2024-09-01 09:00:00 CET,)'::tstzrange)
      ]::cu_sp[]
    ) INTO cu_id;

    INSERT INTO flex.service_providing_group_membership (
      controllable_unit_id, service_providing_group_id, valid_time_range
    ) VALUES (
        cu_id,
        spg_id,
        '[2024-09-01 09:00:00 CET,)'::tstzrange
    );

    INSERT INTO flex.technical_resource (name, controllable_unit_id, details)
    VALUES (
      entity_first_name || ' ' || asset_type || ' Unit #1', cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000'
    ), (
      entity_first_name || ' ' || asset_type || ' Unit #2', cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000'
    ), (
      entity_first_name || ' ' || asset_type || ' Unit #3', cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000'
    );
    -- char(13)

    accounting_point_seq := accounting_point_seq + 1;

  END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;
