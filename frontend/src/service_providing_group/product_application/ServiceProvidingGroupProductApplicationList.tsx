import { Link as RouterLink } from "react-router-dom";
import { usePermissions, useTranslate } from "ra-core";
import { IconPlus, IconTrash } from "@elhub/ds-icons";
import { ResourceListLayout } from "../../components/list/ResourceListLayout";
import type {
  ListColumn,
  ListFilterDef,
  ListInterface,
} from "../../components/list/types";
import { SpgpaStatusBadge } from "../../components/SpgpaStatusBadge";
import { ProductTypeArrayField } from "../../components/ProductTypeArrayField";
import { BodyText, Button, Tooltip } from "../../components/ui";
import { Permissions } from "../../auth/permissions";
import { usePartyOptions } from "../../hooks/partyOptions";
import { useSpgpaDrafts } from "../../hooks/useSpgpaDrafts";
import type { SpgpaDraft } from "../../hooks/useSpgpaDrafts";
import type { ServiceProvidingGroupProductApplication } from "../../generated-client";
import { formatScaled, KILO } from "../../utils/scales";
import { toDateTimeString } from "../../util";
import { DRAFT_STATUS, spgpaStatusVariantMap } from "./spgpaStatus";
import { useServiceProvidingGroupProductApplicationList } from "./useServiceProvidingGroupProductApplicationList";

type Row = ServiceProvidingGroupProductApplication & { __draft?: SpgpaDraft };

const NAME_FILTER = "service_providing_group.name@ilike";
const SERVICE_PROVIDER_FILTER =
  "service_providing_group.service_provider_id@in";

const createPath = (spgId?: number) =>
  spgId
    ? `/service_providing_group/${spgId}/product_application/create`
    : "/service_providing_group_product_application/create";

const Dash = () => <BodyText size="small">-</BodyText>;

const formatPower = (value: number | undefined) =>
  value === undefined ? (
    <Dash />
  ) : (
    <BodyText size="small">{formatScaled(value, "W", KILO)}</BodyText>
  );

const draftToRow = (draft: SpgpaDraft, index: number): Row =>
  ({
    id: -(index + 1),
    service_providing_group_id: draft.spgId,
    service_providing_group: { name: draft.spgName },
    procuring_system_operator: { name: draft.systemOperatorName },
    product_type_ids: draft.values.product_type_ids ?? [],
    maximum_active_power_up: draft.values.maximum_active_power_up,
    maximum_active_power_down: draft.values.maximum_active_power_down,
    status: DRAFT_STATUS,
    __draft: draft,
  }) as unknown as Row;

// Local drafts are not part of the backend data. They are shown first on the
// first page, unless a filter excludes them.
const useListWithDrafts = (
  list: ListInterface<ServiceProvidingGroupProductApplication>,
) => {
  const { drafts, deleteDraft } = useSpgpaDrafts();
  const { filters } = list;

  const nameFilter = filters[NAME_FILTER]?.toLowerCase();
  const showDrafts =
    list.page === 1 &&
    !filters["status@in"] &&
    !filters[SERVICE_PROVIDER_FILTER];

  const draftRows = showDrafts
    ? drafts
        .filter(
          (d) => !nameFilter || d.spgName?.toLowerCase().includes(nameFilter),
        )
        .map(draftToRow)
    : [];

  const listWithDrafts: ListInterface<Row> = {
    ...list,
    rows: [...draftRows, ...list.rows],
  };

  return { list: listWithDrafts, deleteDraft };
};

export const ServiceProvidingGroupProductApplicationList = () => {
  const { permissions } = usePermissions<Permissions>();
  const translate = useTranslate();
  const { list: serverList } = useServiceProvidingGroupProductApplicationList();
  const { list, deleteDraft } = useListWithDrafts(serverList);
  const serviceProviders = usePartyOptions("service_provider");

  const canCreate = permissions?.allow(
    "service_providing_group_product_application",
    "create",
  );

  const filters: ListFilterDef[] = [
    {
      type: "text",
      source: NAME_FILTER,
      label: translate(
        "field.service_providing_group_product_application.service_providing_group_id",
      ),
    },
    {
      type: "multiselect",
      source: SERVICE_PROVIDER_FILTER,
      label: translate("field.service_providing_group.service_provider_id"),
      options: serviceProviders.data ?? [],
      isLoading: serviceProviders.isLoading,
    },
    {
      type: "multiselect",
      source: "status@in",
      label: translate(
        "field.service_providing_group_product_application.status",
      ),
      options: Object.keys(spgpaStatusVariantMap)
        .filter((value) => value !== DRAFT_STATUS)
        .map((value) => ({
          value,
          label: translate(
            `enum.service_providing_group_product_application.status.${value}`,
          ),
        })),
    },
  ];

  const columns: ListColumn<Row>[] = [
    {
      header: translate("field.service_providing_group_product_application.id"),
      render: (row) =>
        row.__draft ? <Dash /> : <BodyText size="small">{row.id}</BodyText>,
    },
    {
      header: translate(
        "field.service_providing_group_product_application.service_providing_group_id",
      ),
      render: (row) => (
        <BodyText size="small" weight="semibold">
          {row.service_providing_group?.name ?? "-"}
        </BodyText>
      ),
    },
    {
      header: translate("field.service_providing_group.service_provider_id"),
      render: (row) => (
        <BodyText size="small">
          {row.service_providing_group?.service_provider?.name ?? "-"}
        </BodyText>
      ),
    },
    {
      header: translate(
        "field.service_providing_group_product_application.procuring_system_operator_id",
      ),
      render: (row) => (
        <BodyText size="small">
          {row.procuring_system_operator?.name ?? "-"}
        </BodyText>
      ),
    },
    {
      header: translate(
        "field.service_providing_group_product_application.product_type_ids",
      ),
      render: (row) => (
        <ProductTypeArrayField productTypeIds={row.product_type_ids} />
      ),
    },
    {
      header: translate(
        "field.service_providing_group_product_application.maximum_active_power_up",
      ),
      render: (row) => formatPower(row.maximum_active_power_up),
    },
    {
      header: translate(
        "field.service_providing_group_product_application.maximum_active_power_down",
      ),
      render: (row) => formatPower(row.maximum_active_power_down),
    },
    {
      header: translate("field.controllable_unit.maximum_active_power"),
      render: (row) =>
        formatPower(
          row.service_providing_group?.summary?.controllable_unit
            .maximum_active_power?.sum,
        ),
    },
    {
      header: translate("field.technical_resource.maximum_active_power"),
      render: (row) =>
        formatPower(
          row.service_providing_group?.summary?.technical_resource
            .maximum_active_power?.sum,
        ),
    },
    {
      header: translate(
        "field.service_providing_group_product_application.status",
      ),
      render: (row) => <SpgpaStatusBadge status={row.status} />,
    },
    {
      header: translate(
        "field.service_providing_group_product_application.complete_at",
      ),
      sortField: "complete_at",
      sortType: "date",
      render: (row) =>
        row.complete_at ? (
          <BodyText size="small">{toDateTimeString(row.complete_at)}</BodyText>
        ) : (
          <Dash />
        ),
    },
  ];

  const actions = canCreate ? (
    <Button as={RouterLink} icon={IconPlus} to={createPath()} variant="primary">
      {translate("text.create")}
    </Button>
  ) : undefined;

  return (
    <ResourceListLayout
      title={translate(
        "text.header_nav_service_providing_group_product_applications",
      )}
      list={list}
      columns={columns}
      filters={filters}
      actions={actions}
      rowActions={(row) => {
        const draft = row.__draft;
        if (!draft) return null;
        return (
          <Tooltip content={translate("text.spgpa_delete_draft")}>
            <Button
              variant="invisible"
              className="text-semantic-background-action-danger"
              size="small"
              icon={IconTrash}
              aria-label={translate("text.spgpa_delete_draft")}
              onClick={() => deleteDraft(draft.spgId, draft.draftId)}
            />
          </Tooltip>
        );
      }}
      rowLink={(row) =>
        row.__draft
          ? {
              to: createPath(row.__draft.spgId),
              state: { ...row.__draft.values, __draftId: row.__draft.draftId },
            }
          : `/service_providing_group_product_application/${row.id}/show`
      }
    />
  );
};
