const CU_BRP_FILTER =
  "accounting_point.balance_responsible_party.balance_responsible_party_id@in";
const CU_BRP_VALID_AT = "accounting_point.balance_responsible_party.valid_at";
// Legacy single-select system operator filter, replaced by "...@in". Old values
// can still be saved in the list params / URL and would silently keep filtering
// without being visible in the UI. Can be removed once such state is gone.
const CU_LEGACY_SYSTEM_OPERATOR_FILTER = "accounting_point.system_operator_id";

// PostgREST requirement, handled here and not in the list component.
// Filtering controllable units on their BRP goes through the accounting point:
// the embed must be an inner join (otherwise PostgREST keeps all parent rows
// and the filter has no effect on the list) and only currently valid BRP links
// must match. Doing this in the data provider, where the final filter and the
// embed are both visible, avoids reading the list state from the store, which
// lags one render behind and caused an extra request.
export const prepareControllableUnitFilter = (
  filter: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...filter };
  delete result[CU_LEGACY_SYSTEM_OPERATOR_FILTER];

  const brp = result[CU_BRP_FILTER];
  const brpActive = Array.isArray(brp) ? brp.length > 0 : Boolean(brp);

  if (!brpActive) {
    delete result[CU_BRP_FILTER];
    return result;
  }

  if (typeof result.embed === "string") {
    result.embed = result.embed.replace(
      "balance_responsible_party(balance_responsible_party)",
      "balance_responsible_party!(balance_responsible_party)",
    );
  }
  result[CU_BRP_VALID_AT] = new Date().toISOString();
  return result;
};
