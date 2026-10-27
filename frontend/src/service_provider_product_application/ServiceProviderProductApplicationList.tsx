import { Link as RouterLink } from "react-router-dom";
import { usePermissions, useTranslate } from "ra-core";
import { IconPlus } from "@elhub/ds-icons";
import { ResourceListLayout } from "../components/list/ResourceListLayout";
import type { ListColumn, ListFilterDef } from "../components/list/types";
import { ProductTypeArrayField } from "../components/ProductTypeArrayField";
import { StatusBadge } from "../components/StatusBadge";
import { BodyText, Button } from "../components/ui";
import { Permissions } from "../auth/permissions";
import { usePartyOptions } from "../hooks/partyOptions";
import { toDateTimeString } from "../util";
import type { ServiceProviderProductApplication } from "../generated-client";
import { sppaStatusVariantMap } from "./show/sppaStatus";
import { useServiceProviderProductApplicationList } from "./useServiceProviderProductApplicationList";

const Dash = () => <BodyText size="small">-</BodyText>;

export const ServiceProviderProductApplicationList = () => {
  const { permissions } = usePermissions<Permissions>();
  const translate = useTranslate();
  const { list } = useServiceProviderProductApplicationList();
  const serviceProviders = usePartyOptions("service_provider");
  const systemOperators = usePartyOptions("system_operator");

  const canCreate = permissions?.allow(
    "service_provider_product_application",
    "create",
  );

  const filters: ListFilterDef[] = [
    {
      type: "multiselect",
      source: "service_provider_id@in",
      label: translate(
        "field.service_provider_product_application.service_provider_id",
      ),
      options: serviceProviders.data ?? [],
      isLoading: serviceProviders.isLoading,
    },
    {
      type: "multiselect",
      source: "system_operator_id@in",
      label: translate(
        "field.service_provider_product_application.system_operator_id",
      ),
      options: systemOperators.data ?? [],
      isLoading: systemOperators.isLoading,
    },
    {
      type: "multiselect",
      source: "status@in",
      label: translate("field.service_provider_product_application.status"),
      options: Object.keys(sppaStatusVariantMap).map((value) => ({
        value,
        label: translate(
          `enum.service_provider_product_application.status.${value}`,
        ),
      })),
    },
  ];

  const columns: ListColumn<ServiceProviderProductApplication>[] = [
    {
      header: translate("field.service_provider_product_application.id"),
      render: (sppa) => <BodyText size="small">{sppa.id}</BodyText>,
    },
    {
      header: translate(
        "field.service_provider_product_application.service_provider_id",
      ),
      render: (sppa) =>
        sppa.service_provider ? (
          <BodyText size="small" weight="semibold">
            {sppa.service_provider.name}
          </BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate(
        "field.service_provider_product_application.system_operator_id",
      ),
      render: (sppa) =>
        sppa.system_operator ? (
          <BodyText size="small">{sppa.system_operator.name}</BodyText>
        ) : (
          <Dash />
        ),
    },
    {
      header: translate(
        "field.service_provider_product_application.product_type_ids",
      ),
      render: (sppa) => (
        <ProductTypeArrayField productTypeIds={sppa.product_type_ids} />
      ),
    },
    {
      header: translate("field.service_provider_product_application.status"),
      render: (sppa) => {
        const variant = sppaStatusVariantMap[sppa.status];
        return variant ? (
          <StatusBadge
            status={variant.status}
            icon={variant.icon}
            label={translate(
              `enum.service_provider_product_application.status.${sppa.status}`,
            )}
          />
        ) : null;
      },
    },
    {
      header: translate(
        "field.service_provider_product_application.qualified_at",
      ),
      sortField: "qualified_at",
      sortType: "date",
      render: (sppa) =>
        sppa.qualified_at ? (
          <BodyText size="small">
            {toDateTimeString(sppa.qualified_at)}
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
      to="/service_provider_product_application/create"
      variant="primary"
    >
      {translate("text.create")}
    </Button>
  ) : undefined;

  return (
    <ResourceListLayout
      title={translate("text.header_nav_service_provider_product_applications")}
      list={list}
      columns={columns}
      filters={filters}
      actions={actions}
      rowLink={(sppa) =>
        `/service_provider_product_application/${sppa.id}/show`
      }
    />
  );
};
