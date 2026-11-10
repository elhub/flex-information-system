import {
  BodyText,
  Button,
  Dropdown,
  Loader,
  Tooltip,
} from "../../components/ui";
import {
  ListFilters,
  type ListFiltersState,
} from "../../components/list/ListFilters";
import type { ListFilterDef } from "../../components/list/types";
import { Column, SimpleTable } from "../../components/SimpleTable";
import { useRemoveMembershipFromShow } from "./useSpgShowViewModel";
import {
  type SpgMemberControllableUnitRow,
  useSpgMemberControllableUnits,
} from "../shared/useSpgMemberControllableUnits";
import { usePermissions, useTranslate } from "ra-core";
import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslateField } from "../../intl/intl";
import { IconDots, IconPencil, IconTrash, IconUser } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { useConfirmAction } from "../../components/ConfirmAction";
import { RegulationDirectionIcon } from "../../controllable_unit/RegulationDirectionField";
import { ControllableUnitRegulationDirection } from "../../generated-client";
import type { AccountingPointGridLocationQuality } from "../../generated-client";
import { GridLocationStatusBadge } from "../../accounting_point/grid_location/GridLocationStatusBadge";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { tooltips } from "../../tooltip/tooltips";

type Props = {
  spgId: number;
  powerScale: Scale;
};

const RowActionsMenu = ({
  membershipId,
  spgId,
  canUpdate,
  canDelete,
}: {
  membershipId: number;
  spgId: number;
  canUpdate: boolean;
  canDelete: boolean;
}) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { mutateAsync: removeMembership } = useRemoveMembershipFromShow(spgId);
  const editPath = `/service_providing_group/${spgId}/membership/${membershipId}`;
  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.spg_membership_remove_title"),
    content: translate("text.spg_membership_remove_confirm"),
    onConfirmMutation: {
      mutationFn: () => removeMembership(membershipId),
    },
    secondaryAction: canUpdate
      ? {
          label: translate("text.spg_membership_edit_action"),
          onClick: () => navigate(editPath),
        }
      : undefined,
  });

  const { permissions } = usePermissions<Permissions>();
  const canReadHistory = !!permissions?.allow(
    "service_providing_group_membership_history",
    "read",
  );
  const canReadEvent = !!permissions?.allow("event", "read");
  const historyFilter = encodeURIComponent(
    JSON.stringify({ service_providing_group_membership_id: membershipId }),
  );
  const eventFilter = encodeURIComponent(
    JSON.stringify({
      "subject@eq": `/service_providing_group_membership/${membershipId}`,
    }),
  );
  const hasActions = canUpdate || canDelete;

  if (!hasActions && !canReadHistory && !canReadEvent) return null;

  return (
    <>
      <Dropdown>
        <Button
          as={Dropdown.Toggle}
          variant="invisible"
          size="small"
          icon={IconDots}
          aria-label={translate(
            "text.resource_show_layout.more_actions_aria_label",
          )}
        />
        <Dropdown.Menu arrow placement="bottom-end">
          {hasActions && (
            <>
              <Dropdown.Menu.GroupedList.Heading>
                {translate("text.resource_show_layout.actions_group_label")}
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList>
                {canUpdate && (
                  <Dropdown.Menu.GroupedList.Item as={RouterLink} to={editPath}>
                    <div className="flex items-center gap-2">
                      <IconPencil />
                      {translate("text.spg_membership_edit_action")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
                {canDelete && (
                  <Dropdown.Menu.GroupedList.Item
                    onClick={() => buttonProps.onClick()}
                  >
                    <div className="flex items-center gap-2 text-semantic-background-action-danger">
                      <IconTrash />
                      {translate("text.spg_membership_remove_title")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
              </Dropdown.Menu.GroupedList>
            </>
          )}
          {(canReadHistory || canReadEvent) && (
            <>
              {hasActions && <Dropdown.Menu.Divider />}
              <Dropdown.Menu.GroupedList.Heading>
                {translate("text.resource_show_layout.navigate_group_label")}
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList>
                {canReadHistory && (
                  <Dropdown.Menu.GroupedList.Item
                    as={RouterLink}
                    to={`/service_providing_group/${spgId}/membership_history?filter=${historyFilter}`}
                  >
                    <div className="flex items-center gap-2">
                      {translate("text.tab.history")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
                {canReadEvent && (
                  <Dropdown.Menu.GroupedList.Item
                    as={RouterLink}
                    to={`/event?filter=${eventFilter}`}
                  >
                    <div className="flex items-center gap-2">
                      {translate("text.events")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
              </Dropdown.Menu.GroupedList>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
      {dialog}
    </>
  );
};

export const ServiceProvidingGroupShowTable = ({
  spgId,
  powerScale,
}: Props) => {
  const { permissions } = usePermissions<Permissions>();
  const canViewGridLocation = !!permissions?.allow(
    "accounting_point_grid_location",
    "read",
  );
  const { data, isLoading, error } = useSpgMemberControllableUnits(
    spgId,
    canViewGridLocation,
  );
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const listFilters: ListFiltersState = {
    filters,
    setFilter: (source, value) =>
      setFilters((prev) => {
        const next = { ...prev };
        if (value) next[source] = value;
        else delete next[source];
        return next;
      }),
    clearFilters: () => setFilters({}),
    resetFilters: () => setFilters({}),
    canResetFilters: false,
  };

  const filterDefs = useMemo<ListFilterDef[]>(() => {
    const systemOperators = new Map<string, string>();
    data?.rows.forEach((cu) => {
      if (cu.accountingPointSystemOperatorId != null) {
        systemOperators.set(
          String(cu.accountingPointSystemOperatorId),
          cu.soName,
        );
      }
    });
    const defs: ListFilterDef[] = [
      {
        type: "text",
        source: "search",
        label: `${t("controllable_unit.name")} / ${t("controllable_unit.accounting_point_id")}`,
        className: "w-52",
      },
      {
        type: "singleselect",
        source: "small",
        label: t("controllable_unit.is_small"),
        tooltip: tooltips["controllable_unit.is_small"],
        options: [
          {
            value: "true",
            label: translate("text.controllable_unit.is_small.true.label"),
          },
          {
            value: "false",
            label: translate("text.controllable_unit.is_small.false.label"),
          },
        ],
        className: "w-32",
      },
      {
        type: "singleselect",
        source: "so",
        label: t("accounting_point.system_operator_id"),
        options: Array.from(systemOperators, ([value, label]) => ({
          value,
          label,
        })),
      },
    ];
    if (canViewGridLocation) {
      defs.push({
        type: "multiselect",
        source: "quality",
        label: translate("text.spg_show_table_location_quality"),
        options: [
          ...(["confirmed", "guessed"] as const).map((value) => ({
            value,
            label: translate(
              `enum.accounting_point_grid_location.quality.${value}`,
            ),
          })),
          {
            value: "missing",
            label: translate(
              "text.accounting_point_grid_location_panel.status.missing",
            ),
          },
        ],
      });
    }
    return defs;
  }, [data?.rows, canViewGridLocation, t, translate]);

  const filteredCUs = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    const qualities = filters.quality ? filters.quality.split(",") : [];
    return data?.rows.filter(
      (cu) =>
        (!search ||
          cu.name?.toLowerCase().includes(search) ||
          cu.mpid.toLowerCase().includes(search)) &&
        (!filters.so ||
          String(cu.accountingPointSystemOperatorId) === filters.so) &&
        (!filters.small || String(cu.is_small) === filters.small) &&
        (!canViewGridLocation ||
          qualities.length === 0 ||
          qualities.includes(cu.locationQuality ?? "missing")),
    );
  }, [filters, data?.rows, canViewGridLocation]);
  const canManageMembers = permissions?.allow(
    "service_providing_group_membership",
    "create",
  );
  const canUpdate = permissions?.allow(
    "service_providing_group_membership",
    "update",
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
            size="small"
            icon={IconUser}
          >
            Manage members
          </Button>
        ) : null}
      </div>
    );
  }

  const columns: Column<SpgMemberControllableUnitRow>[] = [
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
      key: "is_small",
      header: t("controllable_unit.is_small"),
      render: (value) => {
        if (value == null) return null;
        const key = value
          ? "controllable_unit.is_small.true"
          : "controllable_unit.is_small.false";
        return (
          <Tooltip content={translate(`text.${key}`)}>
            <span>
              <BodyText size="small">{translate(`text.${key}.label`)}</BodyText>
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "soName",
      header: t("accounting_point.system_operator_id"),
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
    {
      key: "mpid",
      header: t("controllable_unit.accounting_point_id"),
      render: (value) =>
        value !== "-" ? (
          <BodyText
            size={"small"}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {String(value)}
          </BodyText>
        ) : (
          <>{value}</>
        ),
    },
    ...(canViewGridLocation
      ? [
          {
            key: "locationQuality",
            header: translate("text.spg_show_table_location_quality"),
            render: (value: unknown) => (
              <GridLocationStatusBadge
                quality={
                  value as AccountingPointGridLocationQuality | undefined
                }
              />
            ),
          } satisfies Column<SpgMemberControllableUnitRow>,
        ]
      : []),
    {
      key: "location",
      header: translate("text.technical_resources_show_label"),
      render: (value, row) => (
        <Button
          variant="secondary"
          className="break-normal"
          onClick={() =>
            navigate(
              `/accounting_point/${row.accountingPointId}/show?tab=location`,
            )
          }
        >
          {translate("text.technical_resources_show_location")}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end items-end">
        <div className="flex-1 mr-4">
          <ListFilters filters={filterDefs} list={listFilters} />
        </div>
        {canManageMembers && (
          <Button
            as={RouterLink}
            to={`/service_providing_group/${spgId}/manage-members`}
            variant="primary"
            icon={IconUser}
            size="small"
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
        rowActions={(row) =>
          row.membershipId !== undefined ? (
            <RowActionsMenu
              membershipId={row.membershipId}
              spgId={spgId}
              canUpdate={!!canUpdate}
              canDelete={!!canDelete}
            />
          ) : null
        }
      />
    </div>
  );
};
