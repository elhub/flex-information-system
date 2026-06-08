import { useMemo } from "react";
import { IconExternal } from "@elhub/ds-icons";
import { Checkbox, Loader, Search } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { PowerRatio } from "../../components/PowerRatio";
import { AccountingPointLink } from "../../components/AccountingPointLink";
import { CuStatusBadge } from "../../components/CuStatusBadge";
import { useTranslateField } from "../../intl/intl";
import { useTranslate } from "ra-core";
import { useAddMembersState } from "./useAddMembersState";
import { UpdateErrorAlert } from "./UpdateErrorAlert";
import { ReviewModal } from "./ReviewModal";
import { ValidFromModal } from "./ValidFromModal";
import { SelectionFooter } from "./SelectionFooter";
import { type CuWithMembership } from "./useSpgMemberships";

type Props = {
  spgId: number;
  destination: string;
  submitLabel?: string;
};

export const ManageMembersPanel = ({
  spgId,
  destination,
  submitLabel,
}: Props) => {
  const t = useTranslateField();
  const translate = useTranslate();

  const {
    isLoading,
    filteredCUs,
    toAddCUs,
    toRemoveCUs,
    effectiveCheckedIds,
    setCheckedIds,
    searchQuery,
    setSearchQuery,
    reviewOpen,
    setReviewOpen,
    datePickerOpen,
    setDatePickerOpen,
    validFrom,
    setValidFrom,
    failedCUs,
    isApplying,
    toAdd,
    toRemove,
    totalFlexibleCapacity,
    allFilteredSelected,
    toggleCu,
    toggleSelectAll,
    handleApplyChanges,
    handleNext,
  } = useAddMembersState({ spgId, destination });

  // Shared base columns used in both the main table and the review modal
  const baseColumns: Column<CuWithMembership>[] = useMemo(
    () => [
      {
        key: "id",
        header: t("controllable_unit.id"),
        render: (v) => <span className="whitespace-nowrap">{String(v)}</span>,
      },
      { key: "name", header: t("controllable_unit.name") },
      {
        key: "accounting_point_business_id",
        header: t("controllable_unit.accounting_point_id"),
        render: (v, row) => (
          <AccountingPointLink
            businessId={v as string | undefined}
            accountingPointId={row.accounting_point_id}
          />
        ),
      },
      {
        key: "bidding_zone",
        header: t("accounting_point_bidding_zone.bidding_zone"),
        render: (v) => (v as string | undefined) ?? "—",
      },
      {
        key: "brp_name",
        header: t(
          "accounting_point_balance_responsible_party.balance_responsible_party_id",
        ),
        render: (v) => (v as string | undefined) ?? "—",
      },
      {
        key: "status",
        header: t("controllable_unit.status"),
        render: (v) => <CuStatusBadge status={v as string | undefined} />,
      },
    ],
    [t],
  );

  const mainColumns: Column<CuWithMembership>[] = useMemo(
    () => [
      ...baseColumns.slice(0, 5), // id, name, accounting point, bidding zone, brp
      {
        key: "rated_power",
        header: t("technical_resource.maximum_active_power"),
        render: (v) => (v != null ? `${String(v)} kW` : "—"),
      },
      {
        key: "maximum_active_power",
        header: t("controllable_unit.maximum_active_power"),
        render: (v, row) => (
          <div className="flex items-center justify-end gap-3">
            <span>{String(v)} kW</span>
            <PowerRatio
              flexiblePower={row.maximum_active_power}
              ratedPower={row.rated_power}
            />
          </div>
        ),
      },
      baseColumns[5], // status
    ],
    [baseColumns, t],
  );

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <UpdateErrorAlert failedCUs={failedCUs} />

      <Search
        label={translate("text.spg_manage_members_search_label")}
        hideLabel
        clearButtonLabel={translate("text.spg_manage_members_search_clear")}
        placeholder={translate("text.spg_manage_members_search_placeholder")}
        value={searchQuery}
        onChange={(value) => setSearchQuery(value)}
        onClear={() => setSearchQuery("")}
      />

      <SimpleTable
        size="small"
        data={filteredCUs}
        empty={translate("text.spg_manage_members_empty")}
        columns={mainColumns}
        checkbox={{
          header: (
            <Checkbox
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
            />
          ),
          render: (row) => (
            <Checkbox
              checked={effectiveCheckedIds.has(row.id)}
              onChange={() => toggleCu(row.id)}
            />
          ),
        }}
        action={{
          header: "",
          render: (row) => (
            <a
              href={`#/controllable_unit/${row.id}/show`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={translate("text.spg_manage_members_open_in_new_tab")}
            >
              <IconExternal size="small" />
            </a>
          ),
        }}
      />

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        toAddCUs={toAddCUs}
        toRemoveCUs={toRemoveCUs}
        columns={baseColumns}
      />

      <ValidFromModal
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        toAddCount={toAdd.length}
        validFrom={validFrom}
        setValidFrom={setValidFrom}
        isApplying={isApplying}
        onConfirm={() => void handleApplyChanges(validFrom)}
      />

      <SelectionFooter
        selectedCount={effectiveCheckedIds.size}
        totalFlexibleCapacity={totalFlexibleCapacity}
        hasChanges={toAdd.length > 0 || toRemove.length > 0}
        isApplying={isApplying}
        submitLabel={submitLabel}
        onClearSelection={() => setCheckedIds(new Set())}
        onReview={() => setReviewOpen(true)}
        onNext={handleNext}
      />
    </div>
  );
};
