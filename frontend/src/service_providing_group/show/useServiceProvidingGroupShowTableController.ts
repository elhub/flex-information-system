import { usePermissions, useTranslate } from "ra-core";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { Permissions } from "../../auth/permissions";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import {
  type SpgMembershipRow,
  useSpgShowViewModel,
} from "./useSpgShowViewModel";

// Controller/logic layer: owns data fetching, permissions, search/filter
// state, navigation, and translated labels/formatters. Returns plain data
// and functions only � no JSX, no UI component imports. The presentational
// component decides which DS components to render and builds the column
// definitions from these values.
export const useServiceProvidingGroupShowTableController = (
  spgId: number,
  powerScale: Scale,
) => {
  const { data, isLoading, error } = useSpgShowViewModel(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = data?.rows;
    if (q) {
      result = result?.filter(
        (cu) =>
          cu.name?.toLowerCase().includes(q) ||
          (cu.id != null && String(cu.id).includes(q)) ||
          (cu.mpid != null && String(cu.mpid).includes(q)),
      );
    }
    return result;
  }, [searchQuery, data?.rows]);

  const canManageMembers = !!permissions?.allow(
    "service_providing_group_membership",
    "create",
  );
  const canDelete = !!permissions?.allow(
    "service_providing_group_membership",
    "delete",
  );

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO, powerScale);

  const manageMembersHref = `/service_providing_group/${spgId}/manage-members`;

  const goToControllableUnit = (row: SpgMembershipRow) =>
    navigate(`/controllable_unit/${row.id}/show`);

  const goToAccountingPoint = (accountingPointId: unknown) =>
    navigate(`/accounting_point/${accountingPointId}/show`);

  return {
    isLoading,
    error,
    hasNoMembers: !isLoading && !error && (!data || data.rows.length === 0),
    rows: filteredRows ?? [],
    searchQuery,
    setSearchQuery,
    canManageMembers,
    canDelete,
    manageMembersHref,
    goToControllableUnit,
    goToAccountingPoint,
    formatPower,
    labels: {
      searchLabel: translate("text.spg_show_table_search_label"),
      searchClear: translate("text.spg_show_table_search_clear"),
      searchPlaceholder: translate("text.spg_show_table_search_placeholder"),
      name: t("controllable_unit.name"),
      validFrom: t("service_providing_group_membership.valid_from"),
      validTo: t("service_providing_group_membership.valid_to"),
      ratedPower: t("technical_resource.maximum_active_power"),
      maximumActivePower: t("controllable_unit.maximum_active_power"),
      location: translate("text.technical_resources_show_label"),
      locationButton: translate("text.technical_resources_show_location"),
      mpid: t("controllable_unit.accounting_point_id"),
      brpName: t(
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      ),
      regulationDirection: t("controllable_unit.regulation_direction"),
    },
  };
};
