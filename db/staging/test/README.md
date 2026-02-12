# Testing ESBR staging

The test data CSV file in this directory was made from dumping the ESBR table we
load in the test data, introducing some modifications to test that the update
procedure works correctly.

For instance:

- one record was shifted (instead of ending on day `D`, it ends on `D-1`, and
  the record following is updated to start on `D-1` as well)
- records were removed
- records were changed to contain unknown business IDs
- one record was terminated (end of valid time changed from `null` to a defined
  date) and a new record was introduced after it (the most common case happening
  in real life)

## Test procedure

In order to run the test, first we call the `prepare` operation for ESBR in the
`staging` schema:

```sql
SELECT staging.energy_supplier_balance_responsibility_prepare();
```

Then, we copy the staging table from the test CSV file:

```sql
\COPY staging.energy_supplier_balance_responsibility(
  metering_grid_area_business_id,
  energy_supplier_business_id,
  balance_responsible_party_business_id,
  energy_direction,
  valid_time_range
)
FROM './esbr_staging_test_data.csv'
DELIMITER ';'
CSV HEADER;
```

Finally, call the `finalise` operation that should run the `MERGE` internally,
after doing some checks.

```sql
SELECT staging.energy_supplier_balance_responsibility_finalise();
```

## Results

### Exception

If you delete half of the test CSV file before doing the test, you should get
an exception because we don't load when we expect to lose too much data.

## Correct case

If you run the test with the test CSV file unmodified, you should get the
following results:

```sql
SELECT * FROM flex.energy_supplier_balance_responsibility;
```

- only 3 records should be there on MGA `6` (record `7` should have been
  deleted because of an unknown business ID)
- on record `1`, the end of valid time should have been updated, but at least
  the record is *reused*, not deleted and replaced with another
- record `2` however has different valid time start in the staging table, so it
  should be deleted and replaced with record `19`
- record `4` is the last on MGA `4` before the update, it should be there with
  an ended valid time, and we should have a new record `20` to register the new
  BRP chosen in the updated dataset.
