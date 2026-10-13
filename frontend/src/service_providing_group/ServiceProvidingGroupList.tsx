import { Link as RouterLink } from "react-router-dom";
import { usePermissions, useTranslate } from "ra-core";
import { IconPlus } from "@elhub/ds-icons";
import { ListPageLayout } from "../components/list/ListPageLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { StatusBadge } from "../components/StatusBadge";
import { BodyText, Button } from "../components/ui";
import { Permissions } from "../auth/permissions";
import { zServiceProvidingGroupBiddingZone } from "../generated-client/zod.gen";
import type { ServiceProvidingGroup } from "../generated-client";
import { spgStatusVariantMap } from "./serviceProvidingGroupStatus";
import { ServiceProvidingGroupExpandedRow } from "./ServiceProvidingGroupExpandedRow";
import { useServiceProvidingGroupList } from "./useServiceProvidingGroupList";

export const ServiceProvidingGroupList = () => {
  const { permissions } = usePermissions<Permissions>();
  const translate = useTranslate();
  const { list } = useServiceProvidingGroupList();

  const canCreate = permissions?.allow("service_providing_group", "create");

  const filters: ListFilterDef[] = [
    {
      type: "text",
      source: "name@ilike",
      label: translate("field.service_providing_group.name"),
    },
    {
      type: "multiselect",
      source: "bidding_zone@in",
      label: translate("field.service_providing_group.bidding_zone"),
      options: zServiceProvidingGroupBiddingZone.options.map((value) => ({
        value,
        label: translate(`enum.service_providing_group.bidding_zone.${value}`),
      })),
    },
    {
      type: "multiselect",
      source: "status@in",
      label: translate("field.service_providing_group.status"),
      options: Object.keys(spgStatusVariantMap).map((value) => ({
        value,
        label: translate(`enum.service_providing_group.status.${value}`),
      })),
    },
  ];

  const columns: ListColumn<ServiceProvidingGroup>[] = [
    {
      header: translate("field.service_providing_group.id"),
      render: (spg) => <BodyText size="small">{spg.id}</BodyText>,
    },
    {
      header: translate("field.service_providing_group.name"),
      sortField: "name",
      render: (spg) => (
        <BodyText size="small" weight="semibold">
          {spg.name}
        </BodyText>
      ),
    },
    {
      header: translate("field.service_providing_group.service_provider_id"),
      render: (spg) => (
        <BodyText size="small">{spg.service_provider?.name ?? "-"}</BodyText>
      ),
    },
    {
      header: translate("field.service_providing_group.bidding_zone"),
      sortField: "bidding_zone",
      render: (spg) => (
        <BodyText size="small">
          {translate(
            `enum.service_providing_group.bidding_zone.${spg.bidding_zone}`,
          )}
        </BodyText>
      ),
    },
    {
      header: translate("field.service_providing_group.status"),
      sortField: "status",
      render: (spg) => {
        const variant = spgStatusVariantMap[spg.status];
        return variant ? (
          <StatusBadge
            status={variant.status}
            icon={variant.icon}
            label={translate(
              `enum.service_providing_group.status.${spg.status}`,
            )}
          />
        ) : null;
      },
    },
  ];

  const actions = canCreate ? (
    <Button
      as={RouterLink}
      icon={IconPlus}
      to="/service_providing_group/create"
      variant="primary"
    >
      Create
    </Button>
  ) : undefined;

  return (
    <ListPageLayout
      title="Service providing groups"
      list={list}
      columns={columns}
      filters={filters}
      actions={actions}
      rowLink={(spg) => `/service_providing_group/${spg.id}/show`}
      expandedContent={(spg) => (
        <ServiceProvidingGroupExpandedRow record={spg} />
      )}
    />
  );
};
