-- liquibase formatted sql
-- test_data contains functions to add test data to the database.

-- changeset flex:test-data-create-schema
CREATE SCHEMA IF NOT EXISTS test_data;

-- changeset flex:test-data-create-random-regulation-direction runOnChange:true endDelimiter:--
-- Randomly return 'up', 'down' or 'both'
CREATE OR REPLACE FUNCTION test_data.random_regulation_direction()
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

-- changeset flex:test-data-add-party-for-entity runOnChange:true endDelimiter:--
-- Add a party for an entity based on name and type
CREATE OR REPLACE FUNCTION test_data.add_party_for_entity(
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
      INSERT INTO flex.party (name, type, role, entity_id)
      VALUES (party_name, party_type, 'flex_' || party_type, parent_entity_id)
      RETURNING id INTO party_id;
  ELSE
      INSERT INTO flex.party (name, type, role, business_id, business_id_type, entity_id)
      VALUES (
          party_name, party_type, 'flex_' || party_type,
          party_business_id, party_business_id_type, parent_entity_id
      )
      RETURNING id INTO party_id;
  END IF;

  UPDATE flex.party
  SET status = 'active'
  WHERE id = party_id;

  INSERT INTO flex.party_membership (
    entity_id,
    party_id,
    scopes
  ) VALUES (
    member_entity_id,
    party_id,
    '{manage:data, manage:auth}'
  );

  RETURN party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- changeset flex:test-data-add-party-to-entity runOnChange:true endDelimiter:--
-- Add a party as a member to an entity based on name of party
CREATE OR REPLACE FUNCTION test_data.add_party_to_entity(
    entity_id bigint, party_name text
)
RETURNS bigint
AS $$
DECLARE
  party_id bigint;
BEGIN
  SELECT id INTO party_id FROM flex.party WHERE name = party_name;
  INSERT INTO flex.party_membership (
    entity_id,
    party_id,
    scopes
  ) VALUES (
    entity_id,
    party_id,
    '{manage:data, manage:auth}'
  );
  RETURN party_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- changeset flex:test-data-create-cu-sp-type runOnChange:true endDelimiter:--
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

-- changeset flex:test-data-add-controllable-unit runOnChange:true endDelimiter:--
-- Add a controllable unit with service providers
CREATE OR REPLACE FUNCTION test_data.add_controllable_unit(
    cu_name text,
    so_id bigint,
    accounting_point_id bigint,
    in_end_user_id bigint,
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
    validated_at
  ) VALUES (
    cu_name,
    '2020-01-01',
    test_data.random_regulation_direction(),
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
    validated_at,
    created_by_party_id,
    recorded_by,
    record_time_range,
    replaced_by
  ) VALUES (
    cu.id,
    cu.business_id,
    cu.name || ' COMMON-EU-ES-2023', -- this string will be searched in tests
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
    cu.validated_at,
    cu.created_by_party_id,
    cu.recorded_by,
    -- the record must exist fully during the contract of the former end user
    -- on the AP
    tstzrange(
      '2023-10-01 00:00:00 Europe/Oslo',
      '2023-11-01 00:00:00 Europe/Oslo',
      '[)'
    ),
    0
  ), (
    cu.id,
    cu.business_id,
    cu.name || ' TEST-SP-2024-07',
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
    cu.validated_at,
    cu.created_by_party_id,
    cu.recorded_by,
    -- the record must have overlap with the first CUSP of Test SP
    tstzrange(
      '2023-11-01 00:00:00 Europe/Oslo',
      '2024-08-10 00:00:00 Europe/Oslo',
      '[)'
    ),
    0
  ), (
    cu.id,
    cu.business_id,
    cu.name || ' COMMON-BRP-CUSP-2024',
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
    cu.validated_at,
    cu.created_by_party_id,
    cu.recorded_by,
    -- the record must exist while Common BRP is BRP on the AP
    tstzrange(
      '2024-08-10 00:00:00 Europe/Oslo',
      '2024-08-11 00:00:00 Europe/Oslo',
      '[)'
    ),
    0
  ), (
    cu.id,
    cu.business_id,
    cu.name || ' COMMON-SP-AS-OF-2024',
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
    cu.validated_at,
    cu.created_by_party_id,
    cu.recorded_by,
    -- the record must contain the as-of timestamp of Common SP
    tstzrange(
      '2024-08-11 00:00:00 Europe/Oslo',
      '2025-01-01 00:00:00 Europe/Oslo',
      '[)'
    ),
    0
  ), (
    cu.id,
    cu.business_id,
    cu.name || ' TEST-SP-2025',
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
    cu.validated_at,
    cu.created_by_party_id,
    cu.recorded_by,
    -- the record acts as a newer version that Common SP cannot see
    tstzrange(
      '2025-01-01 00:00:00 Europe/Oslo',
      current_timestamp,
      '[)'
    ),
    0
  );

  FOREACH sp IN ARRAY service_providers
  LOOP
    INSERT INTO flex.controllable_unit_service_provider (
      controllable_unit_id,
      service_provider_id,
      end_user_id,
      contract_reference,
      valid_time_range
    ) VALUES (
      cu.id, sp.sp_id, in_end_user_id, uuid_generate_v4(), sp.valid_time_range
    ) RETURNING * INTO cusp;

    -- insert a previous version of that CUSP valid for the previous end user
    -- (related to end user testing)
    INSERT INTO flex.controllable_unit_service_provider_history (
      id,
      controllable_unit_id,
      service_provider_id,
      end_user_id,
      contract_reference,
      valid_time_range,
      record_time_range,
      recorded_by,
      replaced_by
    ) VALUES (
      cusp.id,
      cusp.controllable_unit_id,
      cusp.service_provider_id,
      in_end_user_id,
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

-- changeset flex:test-data-add-technical-resource runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION test_data.add_technical_resource(
    l_name text,
    l_controllable_unit_id bigint,
    l_details text
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
      l_tr.name || ' COMMON-EU-ES-2023', -- this string will be searched in tests
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
    ), (
      l_tr.id,
      l_tr.name || ' TEST-SP-2024-07',
      l_tr.controllable_unit_id,
      l_tr.details,
      -- the record must have overlap with the first CUSP of Test SP
      tstzrange(
        '2023-11-01 00:00:00 Europe/Oslo',
        '2024-08-10 00:00:00 Europe/Oslo',
        '[)'
      ),
      l_tr.recorded_by,
      0
    ), (
      l_tr.id,
      l_tr.name || ' COMMON-BRP-CUSP-2024',
      l_tr.controllable_unit_id,
      l_tr.details,
      -- the record must exist while Common BRP is BRP on the AP
      -- and while Common SP manages the CU
      tstzrange(
        '2024-08-10 00:00:00 Europe/Oslo',
        '2024-08-11 00:00:00 Europe/Oslo',
        '[)'
      ),
      l_tr.recorded_by,
      0
    ), (
      l_tr.id,
      l_tr.name || ' COMMON-SP-AS-OF-2024',
      l_tr.controllable_unit_id,
      l_tr.details,
      -- the record must contain the as-of timestamp of Common SP
      tstzrange(
        '2024-08-11 00:00:00 Europe/Oslo',
        '2025-01-01 00:00:00 Europe/Oslo',
        '[)'
      ),
      l_tr.recorded_by,
      0
    ), (
      l_tr.id,
      l_tr.name || ' TEST-SP-2025',
      l_tr.controllable_unit_id,
      l_tr.details,
      -- the record acts as a newer version that Common SP cannot see
      tstzrange(
        '2025-01-01 00:00:00 Europe/Oslo',
        current_timestamp,
        '[)'
      ),
      l_tr.recorded_by,
      0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- changeset flex:test-data-accounting-points-type runOnChange:true endDelimiter:--
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

-- changeset flex:test-data-add-accounting-points runOnChange:true endDelimiter:--
-- Add accounting point mapping
CREATE OR REPLACE FUNCTION test_data.add_accounting_points(
    accounting_point_prefix text,
    in_metering_grid_area_id bigint,
    end_user contract_parties,
    energy_supplier contract_parties,
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
      business_id
    ) VALUES (
      gs1.add_check_digit(partial_gsrn::text)
    ) RETURNING id INTO ap_id;

    INSERT INTO flex.accounting_point_metering_grid_area (
      accounting_point_id,
      metering_grid_area_id,
      valid_time_range
    ) VALUES (
      ap_id,
      in_metering_grid_area_id,
      tstzrange('2023-05-01 00:00:00 Europe/Oslo', null, '[)')
    );

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
        tstzrange(
          '2024-01-01 00:00:00 Europe/Oslo',
          '2099-01-01 00:00:00 Europe/Oslo',
          '[)'
        )
      );
    END IF;
  END LOOP;
END
$$;

-- changeset flex:test-data-forge-valid-eic runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION test_data.forge_valid_eic(
    in_prefix int,
    in_entity_name text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    l_eic text;
BEGIN
    -- EIC of the form PPY-NNNN-NNNN--
    -- where P is a character in the prefix and N is a character in the name
    l_eic := eic.add_check_char(
        lpad(left(in_prefix::text, 2), 2, '0') || 'Y-' ||
        upper(replace(rpad(left(in_entity_name, 10), 10), ' ', '-')) || '-'
    );

    -- sometimes the check character is a hyphen, which is not valid
    -- in this case we just increment the prefix and try again
    IF right(l_eic, 1) = '-' THEN
        RETURN test_data.forge_valid_eic(in_prefix + 1, in_entity_name);
    ELSE
        RETURN l_eic;
    END IF;
END
$$;

-- changeset flex:test-data-add-test-account runOnChange:true endDelimiter:--
-- Add a test account with parties and controllable units
CREATE OR REPLACE FUNCTION test_data.add_test_account(
    in_user_seq_id bigint,
    in_entity_name text,
    in_add_fiso boolean,
    in_add_data boolean,
    in_common_party_first_name text
) RETURNS void
AS $$
DECLARE
  user_seq_id_text text := lpad(in_user_seq_id::text, 4, '0');
  entity_name_org text := in_entity_name || ' AS';
  entity_first_name text := split_part(in_entity_name, ' ', 1);
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

  pt_id bigint;

  so_mga_business_id text;
  so_mga_id bigint;

  asset_type text;
  accounting_point_prefix text := '1337000000' || user_seq_id_text;
  accounting_point_seq bigint := rpad(accounting_point_prefix, 17, '0')::bigint;
  ap_id bigint;

  party_business_id_prefix text := '1337' || user_seq_id_text;
  party_business_id_seq bigint :=
      rpad(party_business_id_prefix, 12, '0')::bigint;

  l_mga_id bigint;
BEGIN

  PERFORM flex.set_entity_party_identity(0,0,0);

  -- return early if the entity buiness id is already in use
  PERFORM id FROM flex.entity e WHERE e.business_id = entity_org_business_id;
  IF FOUND THEN
    RETURN;
  END IF;

  -- add entities

  INSERT INTO flex.entity (name, type, business_id, business_id_type)
  VALUES (in_entity_name, 'person', entity_person_business_id, 'pid')
  RETURNING id INTO entity_id_person;

  INSERT INTO flex.entity (name, type, business_id, business_id_type)
  VALUES (entity_name_org, 'organisation', entity_org_business_id, 'org')
  RETURNING id INTO entity_id_org;

  -- add clients

  INSERT INTO flex.entity_client (entity_id, name, scopes)
  VALUES
  (entity_id_person, 'PC #1', '{manage:auth, manage:data}'::text[]),
  (entity_id_org, 'Laptop #4', '{manage:auth, manage:data}'::text[]);

  -- end user parties

  PERFORM test_data.add_party_for_entity(
    entity_id_org,
    entity_id_org,
    entity_first_name || ' AS EU',
   'end_user',
   null,
   null
  );

  eu_id := test_data.add_party_for_entity(
    entity_id_person,
    entity_id_person,
    entity_first_name || ' EU',
   'end_user',
   null,
   null
  );

  -- add parties

  brp_id := test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' BRP',
   'balance_responsible_party',
    gs1.add_check_digit(party_business_id_seq::text),
    'gln'
  );

  es_id := test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' ES',
   'energy_supplier',
    gs1.add_check_digit((party_business_id_seq + 2)::text),
    'gln'
  );

  PERFORM test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' MO',
   'market_operator',
    gs1.add_check_digit((party_business_id_seq + 3)::text),
    'gln'
  );

  so_id := test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' SO',
   'system_operator',
    gs1.add_check_digit((party_business_id_seq + 4)::text),
    'gln'
  );

  sp_id := test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' SP',
   'service_provider',
    gs1.add_check_digit((party_business_id_seq + 5)::text),
    'gln'
  );

  PERFORM test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' TP',
   'third_party',
    gs1.add_check_digit((party_business_id_seq + 6)::text),
    'gln'
  );

  if in_add_fiso then
    PERFORM test_data.add_party_for_entity(
      entity_id_org,
      entity_id_person,
      entity_first_name || ' FISO',
      'flexibility_information_system_operator',
      gs1.add_check_digit((party_business_id_seq + 7)::text),
      'gln'
    );
  end if;

  PERFORM test_data.add_party_for_entity(
    entity_id_org,
    entity_id_person,
    entity_first_name || ' ORG',
   'organisation',
    entity_org_business_id,
   'org'
  );

  SELECT id INTO pt_id
  FROM flex.product_type AS pt
  WHERE pt.business_id = 'manual_congestion';

  -- Product type
  INSERT INTO flex.system_operator_product_type (
    system_operator_id,
    product_type_id
  ) VALUES (
    so_id,
    pt_id
  );

  so_mga_business_id := test_data.forge_valid_eic(42, in_entity_name);

  -- associate a few metering grid areas to the SO
  INSERT INTO flex.metering_grid_area (
    business_id,
    name,
    recorded_by
  ) VALUES (
    test_data.forge_valid_eic(31, in_entity_name),
    in_entity_name || ' AREA 1',
    0
  ) RETURNING id INTO l_mga_id;

  INSERT INTO flex.metering_grid_area_price_area (
    metering_grid_area_id,
    price_area,
    valid_time_range,
    recorded_by
  ) VALUES (
    l_mga_id,
    'NO4',
    tstzrange(
      '2023-10-01 Europe/Oslo',
      null, '[)'
    ),
    0
  );

  INSERT INTO flex.metering_grid_area_system_operator (
    metering_grid_area_id,
    system_operator_id,
    valid_time_range,
    recorded_by
  ) VALUES (
    l_mga_id,
    so_id,
    tstzrange(
      '2023-10-01 Europe/Oslo',
      null, '[)'
    ),
    0
  );

  INSERT INTO flex.metering_grid_area (
    business_id,
    name,
    recorded_by
  ) VALUES (
    so_mga_business_id,
    in_entity_name || ' AREA 2',
    0
  ) RETURNING id INTO l_mga_id;

  INSERT INTO flex.metering_grid_area_price_area (
    metering_grid_area_id,
    price_area,
    valid_time_range,
    recorded_by
  ) VALUES (
    l_mga_id,
    'NO3',
    tstzrange(
      '2023-10-01 Europe/Oslo',
      null, '[)'
    ),
    0
  );

  INSERT INTO flex.metering_grid_area_system_operator (
    metering_grid_area_id,
    system_operator_id,
    valid_time_range,
    recorded_by
  ) VALUES (
    l_mga_id,
    so_id,
    tstzrange(
      '2023-10-01 Europe/Oslo',
      null, '[)'
    ),
    0
  );

  SELECT id INTO so_mga_id
  FROM flex.metering_grid_area
  WHERE business_id = so_mga_business_id;

  if not in_add_data then
    PERFORM test_data.add_accounting_points(
      accounting_point_prefix,
      so_mga_id,
      (eu_id, eu_id),
      null,
      so_id
    );
    return;
  end if;

  common_brp_id := test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' BRP');
  common_eu_id := test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' EU');
  common_es_id := test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' ES');
  PERFORM test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' MO');
  PERFORM test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' SO');
  common_sp_id := test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' SP');
  PERFORM test_data.add_party_to_entity(entity_id_person, in_common_party_first_name || ' TP');

  PERFORM test_data.add_accounting_points(
    accounting_point_prefix,
    so_mga_id,
    (common_eu_id, eu_id),
    (common_es_id, es_id),
    so_id
  );

  INSERT INTO flex.energy_supplier_balance_responsibility (
    metering_grid_area_id,
    energy_supplier_id,
    balance_responsible_party_id,
    energy_direction,
    valid_time_range
  ) VALUES (
    so_mga_id,
    es_id,
    brp_id,
    'production',
    tstzrange('2022-06-01 Europe/Oslo', '2024-07-20 Europe/Oslo', '[)')
  ), (
    so_mga_id,
    es_id,
    common_brp_id,
    'production',
    tstzrange('2024-07-20 Europe/Oslo', '2024-09-10 Europe/Oslo', '[)')
  ), (
    so_mga_id,
    es_id,
    brp_id,
    'production',
    tstzrange('2024-09-10 Europe/Oslo', '2099-01-01 Europe/Oslo', '[)')
  ), (
    so_mga_id,
    es_id,
    brp_id,
    'production',
    tstzrange('2099-01-01 Europe/Oslo', null, '[)')
  );

  INSERT INTO flex.service_providing_group (
    name, service_provider_id, bidding_zone
  ) VALUES (
    entity_first_name || ' SPG', sp_id, 'NO3'
  ) RETURNING id INTO spg_id;

  FOREACH asset_type in ARRAY ARRAY['Car Charger','Water Heater','Solar Panel']::text[]
  LOOP

    SELECT id INTO ap_id
    FROM flex.accounting_point
    WHERE business_id = gs1.add_check_digit(accounting_point_seq::text);

    SELECT test_data.add_controllable_unit(
      entity_first_name || ' ' || asset_type,
      so_id,
      ap_id,
      eu_id,
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

    PERFORM test_data.add_technical_resource(
      entity_first_name || ' ' || asset_type || ' Unit #1',
      cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000'
    );
    PERFORM test_data.add_technical_resource(
      entity_first_name || ' ' || asset_type || ' Unit #2',
      cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000'
    );
    PERFORM test_data.add_technical_resource(
      entity_first_name || ' ' || asset_type || ' Unit #3',
      cu_id,
      E'Make: ACME\nModel: ' || asset_type || ' 2000'
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
    sp_id, so_id, array[pt_id]
  ) RETURNING id INTO sppa_id;

  UPDATE flex.service_provider_product_application
  SET status = 'qualified', qualified_at = CURRENT_TIMESTAMP
  WHERE id = sppa_id;

  INSERT INTO flex.service_provider_product_application_comment (
    service_provider_product_application_id,
    visibility,
    content
  ) VALUES (
    sppa_id,
    'any_involved_party',
    'Test Comment'
  );

  -- SPG product application

  INSERT INTO flex.service_providing_group_product_application (
    service_providing_group_id,
    procuring_system_operator_id,
    product_type_ids
  ) VALUES (
    spg_id,
    so_id,
    array[pt_id]
  ) RETURNING id INTO spgpa_id;

  UPDATE flex.service_providing_group_product_application
  SET status = 'in_progress'
  WHERE service_providing_group_id = spg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;

-- changeset flex:test-data-fill-party-staging runOnChange:true endDelimiter:--
-- Copy parties from flex.party to flex.party_staging
CREATE OR REPLACE FUNCTION test_data.fill_party_staging()
RETURNS void
AS $$
BEGIN
  INSERT INTO flex.party_staging (gln, org, name, type)
  SELECT
      p.business_id AS gln,
      e.business_id AS org,
      p.name,
      p.type
  FROM flex.party AS p
      INNER JOIN flex.entity AS e ON p.entity_id = e.id
  WHERE p.business_id_type = 'gln'
      AND e.business_id_type = 'org'
      AND p.status != 'terminated'
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER VOLATILE;
