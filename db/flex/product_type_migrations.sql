--liquibase formatted sql
-- Manually managed file

-- changeset flex:product-type-list-update runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'product_type' AND column_name = 'market'

SELECT set_config('flex.current_identity', '0', false);

-- new columns
ALTER TABLE flex.product_type ADD COLUMN name text;
ALTER TABLE flex.product_type ADD COLUMN service text;
ALTER TABLE flex.product_type ADD COLUMN products text;

-- avoid having to move IDs when possible, by reusing existing entries
UPDATE flex.product_type
SET
    business_id = 'manual_congestion',
    name = 'Manual Congestion',
    service = 'congestion management',
    products = 'LongFlex, ShortFlex'
WHERE business_id = 'manual_congestion_activation';

UPDATE flex.product_type
SET
    business_id = 'automatic_congestion',
    name = 'Automatic Congestion',
    service = 'congestion management',
    products = 'MaxUsage'
WHERE business_id = 'automatic_congestion_capacity';

UPDATE flex.product_type
SET
    business_id = 'automatic_voltage',
    name = 'Automatic Voltage',
    service = 'voltage control',
    products = null
WHERE business_id = 'automatic_voltage_capacity';

UPDATE flex.product_type
SET
    business_id = 'manual_voltage',
    name = 'Manual Voltage',
    service = 'voltage control',
    products = null
WHERE business_id = 'manual_voltage_capacity';

UPDATE flex.product_type
SET
    business_id = 'automatic_fast_frequency',
    name = 'Fast Frequency',
    service = 'balancing',
    products = 'FFR Profil, FFR Flex'
WHERE business_id = 'automatic_fast_frequency_capacity';

UPDATE flex.product_type
SET
    business_id = 'automatic_frequency_containment',
    name = 'Frequency Containment',
    service = 'balancing',
    products = 'FCR-N, FCR-D'
WHERE business_id = 'automatic_frequency_containment_capacity';

UPDATE flex.product_type
SET
    business_id = 'automatic_frequency_restoration',
    name = 'Automatic Frequency Restoration',
    service = 'balancing',
    products = 'aFRR CM'
WHERE business_id = 'automatic_frequency_restoration_activation';

-- the two last ones are approximative (the former product type is not fully
-- included in the new one), but since we are not applying this migration to
-- real data, it is not really a problem

UPDATE flex.product_type
SET
    business_id = 'manual_frequency_restoration',
    name = 'Manual Frequency Restoration',
    service = 'balancing',
    products = 'mFRR EAM, mFRR CM'
WHERE business_id = 'manual_frequency_restoration_capacity';

UPDATE flex.product_type
SET
    business_id = 'manual_frequency_restoration_disruption',
    name = 'Frequency Restoration Disruption',
    service = 'balancing',
    products = 'mFRR-D'
WHERE business_id = 'manual_frequency_restoration_activation';

-- there are still 2 types to handle, but they are both cases where 2 types were
-- merged into one, so these ones will be deleted, but we need to make sure all
-- the references to these product types are updated before

-- manual_congestion_capacity -> manual_congestion
-- automatic_frequency_restoration_capacity -> automatic_frequency_restoration

-- changeset flex:product-type-list-update-2 runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'product_type' AND column_name = 'market'
DO
$$
DECLARE
  mcc_product_type_id bigint;
  mc_product_type_id bigint;
  afrc_product_type_id bigint;
  afr_product_type_id bigint;
  former_product_type_id bigint;
  new_product_type_id bigint;
  so_id bigint;
BEGIN
  SELECT id INTO mcc_product_type_id
  FROM flex.product_type
  WHERE business_id = 'manual_congestion_capacity';

  SELECT id INTO mc_product_type_id
  FROM flex.product_type
  WHERE business_id = 'manual_congestion';

  SELECT id INTO afrc_product_type_id
  FROM flex.product_type
  WHERE business_id = 'automatic_frequency_restoration_capacity';

  SELECT id INTO afr_product_type_id
  FROM flex.product_type
  WHERE business_id = 'automatic_frequency_restoration';

  FOREACH former_product_type_id, new_product_type_id IN ARRAY ARRAY[
      (mcc_product_type_id, mc_product_type_id),
      (afrc_product_type_id, afr_product_type_id)
  ] LOOP
    -- all SOs linked to the former product type should be linked to the new
    -- (foreign key constraints: adding the new, not deleting the former)
    FOR so_id IN
      SELECT system_operator_id
      FROM flex.system_operator_product_type
      WHERE product_type_id = former_product_type_id
    LOOP
      INSERT INTO flex.system_operator_product_type (
        system_operator_id,
        product_type_id
      )
      VALUES (
        so_id,
        new_product_type_id
      )
      ON CONFLICT DO NOTHING;
    END LOOP;

    -- all SPs linked to the former product type should be linked to the new
    -- (foreign key constraints: adding the new, not deleting the former)
    UPDATE flex.service_provider_product_application
    SET product_type_ids = array_append(product_type_ids, new_product_type_id)
    WHERE former_product_type_id = ANY (product_type_ids)
    AND new_product_type_id != ALL (product_type_ids);

    -- all SPGs linked to the former product type should be linked to the new

    -- if the new one is already linked, just remove the former one
    DELETE FROM flex.service_providing_group_product_application
    WHERE product_type_id = former_product_type_id
    AND EXISTS (
      SELECT 1
      FROM flex.service_providing_group_product_application
      WHERE product_type_id = new_product_type_id
    );

    -- otherwise we can directly update
    UPDATE flex.service_providing_group_product_application
    SET product_type_id = new_product_type_id
    WHERE product_type_id = former_product_type_id;

    -- now we can safely delete the records about the former product types
    -- in SOPT and SPPA
    UPDATE flex.service_provider_product_application
    SET product_type_ids = array_remove(
      product_type_ids,
      former_product_type_id
    );

    DELETE FROM flex.system_operator_product_type
    WHERE product_type_id = former_product_type_id;

    -- now we can delete the product types
    DELETE FROM flex.product_type
    WHERE id = former_product_type_id;
  END LOOP;
END
$$;

-- remove the old columns

-- changeset flex:product-type-list-update-3 runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'product_type' AND column_name = 'market'
ALTER TABLE flex.product_type DROP COLUMN category CASCADE;
ALTER TABLE flex.product_type DROP COLUMN market;
ALTER TABLE flex.product_type DROP COLUMN market_type;
ALTER TABLE flex.product_type DROP COLUMN examples;
ALTER TABLE flex.product_type DROP COLUMN notes;
