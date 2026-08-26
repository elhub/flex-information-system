import { BodyText, Button, Loader, Search } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  type SpgMembershipRow,
  useRemoveMembershipFromShow,
  useSpgShowViewModel,
} from "./useSpgShowViewModel";
import { usePermissions, useTranslate } from "ra-core";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { IconCrossCircle, IconUser } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { useConfirmAction } from "../../components/ConfirmAction";
import { RegulationDirectionIcon } from "../../controllable_unit/RegulationDirectionField";
import { ControllableUnitRegulationDirection } from "../../generated-client";
import { formatScaled, KILO, Scale } from "../../utils/scales";

type Props = {
  spgId: number;
  powerScale: Scale;
};

const DeleteButton = ({
  membershipId,
  spgId,
}: {
  membershipId: number;
  spgId: number;
}) => {
  const { mutateAsync: removeMembership } = useRemoveMembershipFromShow(spgId);
  const { buttonProps, dialog } = useConfirmAction({
    title: "Delete",
    content:
      "Are you sure you want to delete this item? This action cannot be undone.",
    onConfirmMutation: {
      mutationFn: () => removeMembership(membershipId),
    },
  });

  return (
    <>
      <Button
        variant="invisible"
        className="text-semantic-background-action-danger"
        size="large"
        icon={IconCrossCircle}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          buttonProps.onClick();
        }}
      />
      {dialog}
    </>
  );
};

export const ServiceProvidingGroupShowTable = ({
  spgId,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgShowViewModel(spgId);
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCUs = useMemo(() => {
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
  const canManageMembers = permissions?.allow(
    "service_providing_group_membership",
    "create",
  );
  const canDelete = permissions?.allow(
    "service_providing_group_membership",
    "delete",
  );

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO, powerScale);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2">
        <BodyText>No controllable units in this group yet.</BodyText>
        {canManageMembers ? (
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spgId}/manage-members`}
            variant="invisible"
            icon={IconUser}
          >
            Manage members
          </Button>
        ) : null}
      </div>
    );
  }

  const columns: Column<SpgMembershipRow>[] = [
    {
      key: "name",
      header: t("controllable_unit.name"),
    },
    {
      key: "validFrom",
      header: t("service_providing_group_membership.valid_from"),
    },
    {
      key: "validTo",
      header: t("service_providing_group_membership.valid_to"),
    },
    {
      key: "rated_power",
      header: t("technical_resource.maximum_active_power"),
      render: (value) => (
        <div className="text-right">
          {value != null ? formatPower(value) : "—"}
        </div>
      ),
    },
    {
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
      render: (value) => <div className="text-right">{formatPower(value)}</div>,
    },
    {
      key: "location",
      header: translate("text.technical_resources_show_label"),
      render: (value, row) => (
        <Button
          variant="secondary"
          onClick={() =>
            navigate(`/accounting_point/${row.accountingPointId}/show`)
          }
        >
          {translate("text.technical_resources.show_location")}
        </Button>
      ),
    },
    {
      key: "mpid",
      header: t("controllable_unit.accounting_point_id"),
      render: (value, row) =>
        value !== "-" ? (
          <BodyText
            size={"small"}
            as={RouterLink}
            to={`/accounting_point/${row.accountingPointId}/show`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {String(value)}
          </BodyText>
        ) : (
          <>{value}</>
        ),
    },
    {
      key: "brpName",
      header: t(
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      ),
    },
    {
      key: "regulation_direction",
      header: t("controllable_unit.regulation_direction"),
      render: (value) =>
        value ? (
          <RegulationDirectionIcon
            value={value as ControllableUnitRegulationDirection}
          />
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex-1 mr-4">
          <Search
            label={translate("text.spg_show_table_search_label")}
            hideLabel
            clearButtonLabel={translate("text.spg_show_table_search_clear")}
            placeholder={translate("text.spg_show_table_search_placeholder")}
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
        {canManageMembers && (
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spgId}/manage-members`}
            variant="primary"
            icon={IconUser}
          >
            Manage members
          </Button>
        )}
      </div>
      <SimpleTable
        rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
        size="small"
        data={filteredCUs ?? []}
        columns={columns}
        className="w-full"
        action={
          canDelete
            ? {
                header: "Remove from group",
                render: (row) =>
                  row.membershipId !== undefined ? (
                    <DeleteButton
                      membershipId={row.membershipId}
                      spgId={spgId}
                    />
                  ) : null,
              }
            : undefined
        }
      />
    </div>
  );
};
