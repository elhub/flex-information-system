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
    parent_entity_id bigint,
    member_entity_id bigint,
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
      INSERT INTO flex.party (name, type, role, status, entity_id)
      VALUES (party_name, party_type, 'flex_' || party_type, 'active', parent_entity_id)
      RETURNING id INTO party_id;
  ELSE
      INSERT INTO flex.party (name, type, role, status, business_id, business_id_type, entity_id)
      VALUES (
          party_name, party_type, 'flex_' || party_type, 'active',
          party_business_id, party_business_id_type, parent_entity_id
      )
      RETURNING id INTO party_id;
  END IF;

  INSERT INTO flex.party_membership (entity_id, party_id) VALUES (member_entity_id, party_id);

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

-- Types for add_controllable_unit
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
  sp cu_sp;
  cu record;
  cusp record;
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
  ) RETURNING * INTO cu;

  -- insert a previous version of that CU long ago (related to end user testing)
  INSERT INTO flex.controllable_unit_history (
    id,
    business_id,
    name,
    start_date,
    regulation_direction,
    maximum_available_capacity,
    minimum_duration,
    maximum_duration,
    recovery_duration,
    ramp_rate,
    status,
    is_small,
    accounting_point_id,
    grid_node_id,
    grid_validation_status,
    grid_validation_notes,
    last_validated,
    created_by_party_id,
    recorded_by,
    record_time_range,
    replaced_by
  ) VALUES (
    cu.id,
    cu.business_id,
    cu.name || ' FORMER NAME', -- this string will be searched in tests
    cu.start_date,
    cu.regulation_direction,
    cu.maximum_available_capacity,
    cu.minimum_duration,
    cu.maximum_duration,
    cu.recovery_duration,
    cu.ramp_rate,
    cu.status,
    cu.is_small,
    cu.accounting_point_id,
    cu.grid_node_id,
    cu.grid_validation_status,
    cu.grid_validation_notes,
    cu.last_validated,
    cu.created_by_party_id,
    cu.recorded_by,
    -- the record must exist fully during the contract of the former end user
    -- on the AP
    tstzrange(
      '2023-10-01 00:00:00 Europe/Oslo',
      '2023-11-01 00:00:00 Europe/Oslo',
      '[)'),
    0
  );

  FOREACH sp IN ARRAY service_providers
  LOOP
    INSERT INTO flex.controllable_unit_service_provider (
      controllable_unit_id, service_provider_id, contract_reference, valid_time_range
    ) VALUES (
      cu.id, sp.sp_id, uuid_generate_v4(), sp.valid_time_range
    ) RETURNING * INTO cusp;

    -- insert a previous version of that CUSP valid for the previous end user
    -- (related to end user testing)
    INSERT INTO flex.controllable_unit_service_provider_history (
      id,
      controllable_unit_id,
      service_provider_id,
      contract_reference,
      valid_time_range,
      record_time_range,
      recorded_by,
      replaced_by
    ) VALUES (
      cusp.id,
      cusp.controllable_unit_id,
      cusp.service_provider_id,
      uuid_generate_v4(),
      tstzrange(
        '2023-10-01 00:00:00 Europe/Oslo',
        '2023-11-01 00:00:00 Europe/Oslo',
        '[)'
      ),
      tstzrange(
        '2023-10-01 00:00:00 Europe/Oslo',
        '2023-11-01 00:00:00 Europe/Oslo',
        '[)'
      ),
      cusp.recorded_by,
      0
    );
  END LOOP;

  RETURN cu.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

CREATE OR REPLACE FUNCTION add_technical_resource(
    l_name text,
    l_controllable_unit_id bigint,
    l_details text,
    l_former_record_time_range tstzrange
)
RETURNS void
AS $$
DECLARE
    l_tr record;
BEGIN
    INSERT INTO flex.technical_resource (name, controllable_unit_id, details)
    VALUES (l_name, l_controllable_unit_id, l_details)
    RETURNING * INTO l_tr;

    -- insert a previous version of that TR valid for the previous EU/BRP/ES
    -- (related to testing of these roles)
    INSERT INTO flex.technical_resource_history (
      id,
      name,
      controllable_unit_id,
      details,
      record_time_range,
      recorded_by,
      replaced_by
    ) VALUES (
      l_tr.id,
      l_tr.name || ' FORMER NAME', -- this string will be searched in tests
      l_tr.controllable_unit_id,
      l_tr.details,
    -- the record must exist fully during the contract of the former end user
    -- on the AP
      tstzrange(
        '2023-10-01 00:00:00 Europe/Oslo',
        '2023-11-01 00:00:00 Europe/Oslo',
        '[)'
      ),
      l_tr.recorded_by,
      0
    );

    -- insert a previous version of that TR valid at the given time range
    INSERT INTO flex.technical_resource_history (
      id,
      name,
      controllable_unit_id,
      details,
      record_time_range,
      recorded_by,
      replaced_by
    ) VALUES (
      l_tr.id,
      l_tr.name || ' CUSTOM FORMER TR', -- this string will be searched in tests
      l_tr.controllable_unit_id,
      l_tr.details,
      l_former_record_time_range,
      l_tr.recorded_by,
      0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- Types for add_accounting_points
DO
$$
BEGIN
  CREATE TYPE contract_parties AS (
      former_id bigint,
      new_id bigint
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

-- Add accounting point mapping
CREATE OR REPLACE FUNCTION add_accounting_points(
    accounting_point_prefix text,
    end_user contract_parties,
    energy_supplier contract_parties,
    balance_responsible_party contract_parties,
    so_id bigint
)
RETURNS void
SECURITY DEFINER VOLATILE
LANGUAGE plpgsql
AS $$
DECLARE
  ap_id bigint;
  partial_gsrn text;
BEGIN
  FOR partial_gsrn IN
    -- This generates a series of GSRNs with the given prefix.
    -- By padding the prefix with zeros and nines to 17 digits total we can
    -- generate a series that "fills" the whole prefix.
    -- If the prefix is 1234 we generate GSRNs
    -- from 12340000000000000 to 12349999999999999.
    -- The check digit is then added to make the GSRN complete.
      SELECT generate_series(
        rpad(accounting_point_prefix,17,'0')::bigint,
        rpad(accounting_point_prefix,17,'9')::bigint,
        1 --step
      )
  LOOP
    INSERT INTO flex.accounting_point (
      business_id,
      system_operator_id
    ) VALUES (
      add_check_digit(partial_gsrn::text),
      so_id
    ) RETURNING id INTO ap_id;

    IF end_user IS NOT NULL THEN
      -- insert 2 end users for each accounting point
      INSERT INTO flex.accounting_point_end_user (
        accounting_point_id,
        end_user_id,
        valid_time_range
      ) VALUES (
        ap_id,
        end_user.former_id,
        tstzrange(
          '2023-05-01 00:00:00 Europe/Oslo',
          '2024-01-01 00:00:00 Europe/Oslo',
          '[)'
        )
      ), (
        ap_id,
        end_user.new_id,
        tstzrange('2024-01-01 00:00:00 Europe/Oslo', null, '[)')
      );
    END IF;

    IF energy_supplier IS NOT NULL THEN
      -- insert 2 energy suppliers for each accounting point
      INSERT INTO flex.accounting_point_energy_supplier (
        accounting_point_id,
        energy_supplier_id,
        valid_time_range
      ) VALUES (
        ap_id,
        energy_supplier.former_id,
        tstzrange(
          '2023-05-01 00:00:00 Europe/Oslo',
          '2024-01-01 00:00:00 Europe/Oslo',
          '[)'
        )
      ), (
        ap_id,
        energy_supplier.new_id,
        tstzrange('2024-01-01 00:00:00 Europe/Oslo', null, '[)')
      );
    END IF;

    IF balance_responsible_party IS NOT NULL THEN
      -- insert 2 balance responsible parties for each accounting point
      INSERT INTO flex.accounting_point_balance_responsible_party (
        accounting_point_id,
        balance_responsible_party_id,
        valid_time_range
      ) VALUES (
        ap_id,
        balance_responsible_party.former_id,
        tstzrange(
          '2023-05-01 00:00:00 Europe/Oslo',
          '2024-01-01 00:00:00 Europe/Oslo',
          '[)'
        )
      ), (
        ap_id,
        balance_responsible_party.new_id,
        tstzrange('2024-01-01 00:00:00 Europe/Oslo', null, '[)')
      );
    END IF;
  END LOOP;
END
$$;

-- Add a test account with parties and controllable units
DROP FUNCTION IF EXISTS add_test_account;
CREATE OR REPLACE FUNCTION add_test_account(
    in_user_seq_id bigint,
    in_email text,
    in_add_fiso boolean,
    in_add_data boolean,
    in_common_party_first_name text
) RETURNS void
AS $$
DECLARE
  user_seq_id_text text := lpad(in_user_seq_id::text, 4, '0');
  entity_name text := email_to_name(in_email);
  entity_name_org text := entity_name || ' AS';
  entity_first_name text := split_part(entity_name, ' ', 1);
  entity_org_business_id text := '13370' || user_seq_id_text;
  entity_person_business_id text := '1337000' || user_seq_id_text;

  entity_id_org bigint;
  entity_id_person bigint;
  sp_id bigint;
  common_sp_id bigint;
  eu_id bigint;
  common_eu_id bigint;
  es_id bigint;
  common_es_id bigint;
  brp_id bigint;
  common_brp_id bigint;

  spg_id bigint;
  spggp_id bigint;
  sppa_id bigint;
  spgpa_id bigint;
  cu_id bigint;
  so_id bigint;

  asset_type text;
  accounting_point_prefix text := '1337000000' || user_seq_id_text;
  accounting_point_seq bigint := rpad(accounting_point_prefix, 17, '0')::bigint;

  party_business_id_prefix text := '1337' || user_seq_id_text;
  party_business_id_seq bigint :=
      rpad(party_business_id_prefix, 12, '0')::bigint;
BEGIN
  -- return early if the entity buiness id is already in use
  PERFORM id FROM flex.entity e WHERE e.business_id = entity_org_business_id;
  IF FOUND THEN
    RETURN;
  END IF;

  -- add entities

  INSERT INTO flex.entity (name, type, business_id, business_id_type, client_id)
  VALUES (entity_name, 'person', entity_person_business_id, 'pid', in_email)
  RETURNING id INTO entity_id_person;

  INSERT INTO flex.entity (name, type, business_id, business_id_type, client_id)
  VALUES (entity_name_org, 'organisation', entity_org_business_id, 'org', public.uuid_generate_v4())
  RETURNING id INTO entity_id_org;

  -- end user parties

  PERFORM add_party_for_entity(
    entity_id_org,
    entity_id_org,
    entity_first_name || ' AS EU',
   'end_user',
   null,
   null
  );

  eu_id := add_party_for_entity(
    entity_id_person,
    entity_id_person,
    entity_first_name || ' EU',
   'end_user',
   null,
   null
  );

  -- add parties

  brp_id := add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' BRP',
   'balance_responsible_party',
    add_check_digit(party_business_id_seq::text),
    'gln'
  );

  es_id := add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' ES',
   'energy_supplier',
    add_check_digit((party_business_id_seq + 2)::text),
    'gln'
  );

  PERFORM add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' MO',
   'market_operator',
    add_check_digit((party_business_id_seq + 3)::text),
    'gln'
  );

  so_id := add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' SO',
   'system_operator',
    add_check_digit((party_business_id_seq + 4)::text),
    'gln'
  );

  sp_id := add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' SP',
   'service_provider',
    add_check_digit((party_business_id_seq + 5)::text),
    'gln'
  );

  PERFORM add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' TP',
   'third_party',
    add_check_digit((party_business_id_seq + 6)::text),
    'gln'
  );

  if in_add_fiso then
    PERFORM add_party_for_entity(
      entity_id_org,
      entity_id_person,
      entity_first_name || ' FISO',
      'flexibility_information_system_operator',
      add_check_digit((party_business_id_seq + 7)::text),
      'gln'
    );
  end if;

  -- Product type
  INSERT INTO flex.system_operator_product_type (
    system_operator_id,
    product_type_id
  ) SELECT so_id, id
  FROM flex.product_type pt
  WHERE pt.business_id in ('manual_congestion_activation', 'manual_congestion_capacity');

  if not in_add_data then
    PERFORM add_accounting_points(
      accounting_point_prefix,
      null,
      null,
      null,
      so_id
    );
    return;
  end if;

  common_brp_id := add_party_to_entity(entity_id_person, in_common_party_first_name || ' BRP');
  common_eu_id := add_party_to_entity(entity_id_person, in_common_party_first_name || ' EU');
  common_es_id := add_party_to_entity(entity_id_person, in_common_party_first_name || ' ES');
  PERFORM add_party_to_entity(entity_id_person, in_common_party_first_name || ' MO');
  PERFORM add_party_to_entity(entity_id_person, in_common_party_first_name || ' SO');
  common_sp_id := add_party_to_entity(entity_id_person, in_common_party_first_name || ' SP');
  PERFORM add_party_to_entity(entity_id_person, in_common_party_first_name || ' TP');

  PERFORM add_accounting_points(
    accounting_point_prefix,
    (common_eu_id, eu_id),
    (common_es_id, es_id),
    (common_brp_id, brp_id),
    so_id
  );

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
          (sp_id, '[2024-07-01 00:00:00 Europe/Oslo,2024-08-01 00:00:00 Europe/Oslo)'::tstzrange),
          (common_sp_id, '[2024-08-01 00:00:00 Europe/Oslo,2024-09-01 00:00:00 Europe/Oslo)'::tstzrange),
          (sp_id, '[2024-09-01 00:00:00 Europe/Oslo,)'::tstzrange)
      ]::cu_sp[]
    ) INTO cu_id;

    INSERT INTO flex.service_providing_group_membership (
      controllable_unit_id, service_providing_group_id, valid_time_range
    ) VALUES (
        cu_id,
        spg_id,
        '[2024-09-01 00:00:00 Europe/Oslo,)'::tstzrange
    );

    PERFORM add_technical_resource(
      entity_first_name || ' ' || asset_type || ' Unit #1',
      cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000',
      '[2024-08-10 00:00:00 Europe/Oslo,2024-08-14 00:00:00 Europe/Oslo)'::tstzrange
    );
    PERFORM add_technical_resource(
      entity_first_name || ' ' || asset_type || ' Unit #2',
      cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000',
      '[2024-08-10 00:00:00 Europe/Oslo,2024-08-14 00:00:00 Europe/Oslo)'::tstzrange
    );
    PERFORM add_technical_resource(
      entity_first_name || ' ' || asset_type || ' Unit #3',
      cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000',
      '[2024-08-10 00:00:00 Europe/Oslo,2024-08-14 00:00:00 Europe/Oslo)'::tstzrange
    );

    accounting_point_seq := accounting_point_seq + 1;

  END LOOP;

  -- SPG grid prequalification

  UPDATE flex.service_providing_group
  SET status = 'active'
  WHERE id = spg_id;

  -- no need to create SPGGP because activating the SP creates one automatically
  -- we can therefore directly find it here
  SELECT id INTO spggp_id
  FROM flex.service_providing_group_grid_prequalification
  WHERE service_providing_group_id = spg_id
  AND impacted_system_operator_id = so_id;

  UPDATE flex.service_providing_group_grid_prequalification
  SET status = 'in_progress'
  WHERE id = spggp_id;

  -- SP product application + comment

  INSERT INTO flex.service_provider_product_application (
    service_provider_id, system_operator_id, product_type_ids
  ) VALUES (
    sp_id, so_id, array[1]
  ) RETURNING id INTO sppa_id;

  UPDATE flex.service_provider_product_application
  SET status = 'qualified'
  WHERE id = sppa_id;

  INSERT INTO flex.service_provider_product_application_comment (
    service_provider_product_application_id,
    visibility,
    content
  ) VALUES (
    sppa_id,
    'any_party',
    'Test Comment'
  );

  -- SPG product application

  INSERT INTO flex.service_providing_group_product_application (
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_id
  ) VALUES (
    spg_id,
    so_id,
    1
  ) RETURNING id INTO spgpa_id;

  UPDATE flex.service_providing_group_product_application
  SET status = 'in_progress'
  WHERE service_providing_group_id = spg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;
