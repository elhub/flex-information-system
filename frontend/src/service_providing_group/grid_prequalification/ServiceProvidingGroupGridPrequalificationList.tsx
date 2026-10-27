import { Link as RouterLink } from "react-router-dom";
import { usePermissions, useTranslate } from "ra-core";
import { IconPlus } from "@elhub/ds-icons";
import { ResourceListLayout } from "../../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../../components/list/types";
import { StatusBadge } from "../../components/StatusBadge";
import { BodyText, Button } from "../../components/ui";
import { Permissions } from "../../auth/permissions";
import { usePartyOptions } from "../../hooks/partyOptions";
import { toDateTimeString } from "../../util";
import type { ServiceProvidingGroupGridPrequalification } from "../../generated-client";
import { spgpqStatusVariantMap } from "./spgpqStatus";
import {
  SPG_NAME_FILTER_SOURCE,
  useServiceProvidingGroupGridPrequalificationList,
} from "./useServiceProvidingGroupGridPrequalificationList";

const Dash = () => <BodyText size="small">-</BodyText>;

export const ServiceProvidingGroupGridPrequalificationList = () => {
  const { permissions } = usePermissions<Permissions>();
  const translate = useTranslate();
  const { list } = useServiceProvidingGroupGridPrequalificationList();
  const systemOperators = usePartyOptions("system_operator");

  const canCreate = permissions?.allow(
    "service_providing_group_grid_prequalification",
    "create",
  );

  const filters: ListFilterDef[] = [
    {
      type: "text",
      source: SPG_NAME_FILTER_SOURCE,
      label: translate(
        "field.service_providing_group_grid_prequalification.service_providing_group_id",
      ),
    },
    {
      type: "multiselect",
      source: "impacted_system_operator_id@in",
      label: translate(
        "field.service_providing_group_grid_prequalification.impacted_system_operator_id",
      ),
      options: systemOperators.data ?? [],
      isLoading: systemOperators.isLoading,
    },
    {
      type: "multiselect",
      source: "status@in",
      label: translate(
        "field.service_providing_group_grid_prequalification.status",
      ),
      options: Object.keys(spgpqStatusVariantMap)
        .filter((value) => value !== "inactive")
        .map((value) => ({
          value,
          label: translate(
            `enum.service_providing_group_grid_prequalification.status.${value}`,
          ),
        })),
    },
  ];

  const columns: ListColumn<ServiceProvidingGroupGridPrequalification>[] = [
    {
      header: translate(
        "field.service_providing_group_grid_prequalification.id",
      ),
      render: (pq) => <BodyText size="small">{pq.id}</BodyText>,
    },
    {
      header: translate(
        "field.service_providing_group_grid_prequalification.service_providing_group_id",
      ),
      render: (pq) =>
        pq.service_providing_group ? (
          <BodyText size="small" weight="semibold">
            {pq.service_providing_group.name}
          </BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate(
        "field.service_providing_group_grid_prequalification.impacted_system_operator_id",
      ),
      render: (pq) =>
        pq.impacted_system_operator ? (
          <BodyText size="small">{pq.impacted_system_operator.name}</BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate(
        "field.service_providing_group_grid_prequalification.status",
      ),
      render: (pq) => {
        const variant = spgpqStatusVariantMap[pq.status];
        return variant ? (
          <StatusBadge
            status={variant.status}
            icon={variant.icon}
            label={translate(
              `enum.service_providing_group_grid_prequalification.status.${pq.status}`,
            )}
          />
        ) : null;
      },
    },
    {
      header: translate(
        "field.service_providing_group_grid_prequalification.prequalified_at",
      ),
      sortField: "prequalified_at",
      sortType: "date",
      render: (pq) =>
        pq.prequalified_at ? (
          <BodyText size="small">
            {toDateTimeString(pq.prequalified_at)}
          </BodyText>
        ) : (
          <Dash />
        ),
    },
  ];

  const actions = canCreate ? (
    <Button
      as={RouterLink}
      icon={IconPlus}
      to="/service_providing_group_grid_prequalification/create"
      variant="primary"
    >
      {translate("text.create")}
    </Button>
  ) : undefined;

  return (
    <ResourceListLayout
      title={translate("text.header_nav_grid_prequalification")}
      list={list}
      columns={columns}
      filters={filters}
      actions={actions}
      rowLink={(pq) =>
        `/service_providing_group/${pq.service_providing_group_id}/grid_prequalification/${pq.id}/show`
      }
    />
  );
};
