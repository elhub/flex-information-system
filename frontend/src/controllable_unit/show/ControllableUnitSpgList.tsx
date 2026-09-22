import { useState } from "react";
import {
  usePermissions,
  RecordContextProvider,
  ResourceContextProvider,
  useTranslate,
} from "ra-core";
import { useNavigate } from "react-router-dom";
import { FormItem, FormItemLabel, Loader, Switch } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { Permissions } from "../../auth/permissions";
import { spgStatusVariantMap } from "../../service_providing_group/serviceProvidingGroupStatus";
import {
  useControllableUnitSpgMemberships,
  useControllableUnitSpgMembershipHistory,
} from "./useControllableUnitSpgMemberships";
import { toDateString } from "../../util";
import {
  DateField,
  IdentityField,
  StatusBadgeField,
} from "../../components/EDS-ra/fields";

type Props = {
  cuId: number;
};

type SpgMembershipRow = {
  id: number;
  spg_id: number;
  membership_id: number;
  name: string;
  status: string;
  valid_from: string;
  valid_to: string;
  history_id?: number;
  recorded_at?: string;
  recorded_by?: number;
  replaced_at?: string;
  replaced_by?: number;
};

export const ControllableUnitSpgList = ({ cuId }: Props) => {
  const [showHistory, setShowHistory] = useState(false);
  const {
    data: memberships,
    isLoading: isLoadingMemberships,
    error: membershipsError,
  } = useControllableUnitSpgMemberships(cuId, { enabled: !showHistory });
  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useControllableUnitSpgMembershipHistory(cuId, { enabled: showHistory });
  const navigate = useNavigate();
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();

  const canReadHistory = permissions?.allow(
    "service_providing_group_membership_history",
    "read",
  );

  const isLoading = showHistory ? isLoadingHistory : isLoadingMemberships;
  const error = showHistory ? historyError : membershipsError;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  const rows: SpgMembershipRow[] = showHistory
    ? (history ?? []).map((membership) => ({
        id: membership.id,
        spg_id: membership.service_providing_group_id,
        membership_id: membership.service_providing_group_membership_id,
        name: membership.service_providing_group?.name ?? "-",
        status: membership.service_providing_group?.status ?? "",
        valid_from: toDateString(membership.valid_from),
        valid_to: toDateString(membership.valid_to),
        history_id: membership.id,
        recorded_at: membership.recorded_at,
        recorded_by: membership.recorded_by,
        replaced_at: membership.replaced_at,
        replaced_by: membership.replaced_by,
      }))
    : (memberships ?? []).map((membership) => ({
        id: membership.id,
        spg_id: membership.service_providing_group_id,
        membership_id: membership.id,
        name: membership.service_providing_group?.name ?? "-",
        status: membership.service_providing_group?.status ?? "",
        valid_from: toDateString(membership.valid_from),
        valid_to: toDateString(membership.valid_to),
      }));

  const columns: Column<SpgMembershipRow>[] = [
    {
      key: "spg_id",
      header: translate("text.cu_spg_id"),
    },
    {
      key: "name",
      header: translate("field.service_providing_group.name"),
    },
    {
      key: "status",
      header: translate("field.service_providing_group.status"),
      render: (value, row) => (
        <RecordContextProvider value={row}>
          <StatusBadgeField
            source="status"
            enumKey="service_providing_group.status"
            variantMap={spgStatusVariantMap}
          />
        </RecordContextProvider>
      ),
    },
    {
      key: "valid_from",
      header: translate("field.service_providing_group_membership.valid_from"),
    },
    {
      key: "valid_to",
      header: translate("field.service_providing_group_membership.valid_to"),
    },
  ];

  if (showHistory) {
    columns.push(
      {
        key: "history_id",
        header: translate("text.table.header.history_id"),
      },
      {
        key: "recorded_at",
        header: translate(
          "field.service_providing_group_membership_history.recorded_at",
        ),
        render: (value, row) => (
          <ResourceContextProvider value="service_providing_group_membership_history">
            <RecordContextProvider value={row}>
              <DateField source="recorded_at" showTime />
            </RecordContextProvider>
          </ResourceContextProvider>
        ),
      },
      {
        key: "recorded_by",
        header: translate(
          "field.service_providing_group_membership_history.recorded_by",
        ),
        render: (value, row) => (
          <ResourceContextProvider value="service_providing_group_membership_history">
            <RecordContextProvider value={row}>
              <IdentityField source="recorded_by" />
            </RecordContextProvider>
          </ResourceContextProvider>
        ),
      },
      {
        key: "replaced_at",
        header: translate(
          "field.service_providing_group_membership_history.replaced_at",
        ),
        render: (value, row) => (
          <ResourceContextProvider value="service_providing_group_membership_history">
            <RecordContextProvider value={row}>
              <DateField source="replaced_at" showTime />
            </RecordContextProvider>
          </ResourceContextProvider>
        ),
      },
      {
        key: "replaced_by",
        header: translate(
          "field.service_providing_group_membership_history.replaced_by",
        ),
        render: (value, row) => (
          <ResourceContextProvider value="service_providing_group_membership_history">
            <RecordContextProvider value={row}>
              <IdentityField source="replaced_by" />
            </RecordContextProvider>
          </ResourceContextProvider>
        ),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {canReadHistory && (
        <FormItem id="cu-spg-show-history">
          <FormItemLabel>{translate("text.cu_spg_show_history")}</FormItemLabel>
          <Switch
            checked={showHistory}
            onChange={(e) => setShowHistory(e.target.checked)}
          />
        </FormItem>
      )}
      <SimpleTable
        rowClick={(row) =>
          navigate(`/service_providing_group/${row.spg_id}/show`)
        }
        size="small"
        data={rows}
        columns={columns}
        className="w-full"
        empty={translate("text.cu_spg_empty")}
      />
    </div>
  );
};
