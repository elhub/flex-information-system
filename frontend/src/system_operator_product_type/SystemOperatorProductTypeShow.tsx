import { IconPencil } from "@elhub/ds-icons";
import { formatDate } from "date-fns";
import {
  ShowBase,
  useGetOne,
  usePermissions,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { useTabSearchParam } from "../hooks/useTabSearchParam";
import { Permissions } from "../auth/permissions";
import { SystemOperatorProductTypeHistoryList } from "./SystemOperatorProductTypeHistoryList";
import { ResourceCard } from "../components/ResourceCard";
import { BodyText, Loader, Tabs } from "../components/ui";
import { IdentityField } from "../components/EDS-ra";
import {
  ResourceShowLayout,
  ResourceSummaryField,
} from "../components/ResourceShowLayout";
import { SystemOperatorProductTypeHistory } from "../generated-client";
import { getFields } from "../zod";
import { zSystemOperatorProductTypeHistory } from "../generated-client/zod.gen";
import { useTranslateEnum } from "../intl/intl";
import { partyStatusVariantMap } from "../party/partyStatus";

type SystemOperatorProductTypeRecord = SystemOperatorProductTypeHistory;

const fields = getFields(zSystemOperatorProductTypeHistory.shape);

const SystemOperatorProductTypeShowTabs = () => {
  const record = useRecordContext<SystemOperatorProductTypeRecord>();
  const translate = useTranslate();
  const [tab, setTab] = useTabSearchParam("overview");
  const { permissions } = usePermissions<Permissions>();
  const soptId = record?.system_operator_product_type_id ?? record?.id;
  const canViewHistory = !!permissions?.allow(
    "system_operator_product_type_history",
    "read",
  );
  const { data: party } = useGetOne(
    "party",
    { id: record?.system_operator_id },
    { enabled: !!record?.system_operator_id },
  );
  const { data: productType } = useGetOne(
    "product_type",
    { id: record?.product_type_id },
    { enabled: !!record?.product_type_id },
  );

  return (
    <Tabs value={tab} onChange={setTab} className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
        {canViewHistory && (
          <Tabs.Tab label={translate("text.tab.history")} value="history" />
        )}
      </Tabs.List>
      <Tabs.Panel value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <ResourceCard
            title={translate(
              "field.system_operator_product_type.system_operator_id",
            )}
            content={[
              { labelKey: "party.name", value: party?.name },
              { labelKey: "party.business_id", value: party?.business_id },
            ]}
            to={`/party/${record?.system_operator_id}/show`}
            linkText={translate(
              "text.system_operator_product_type.see_system_operator",
            )}
          />
          <ResourceCard
            title={translate(
              "field.system_operator_product_type.product_type_id",
            )}
            content={[
              { labelKey: "product_type.name", value: productType?.name },
              {
                labelKey: "product_type.products",
                value: productType?.products,
              },
            ]}
            to={`/product_type/${record?.product_type_id}/show`}
            linkText={translate(
              "text.system_operator_product_type.see_product_type",
            )}
          />
        </div>
      </Tabs.Panel>
      {canViewHistory && (
        <Tabs.Panel value="history">
          <SystemOperatorProductTypeHistoryList
            systemOperatorProductTypeId={"" + soptId}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  );
};

const SystemOperatorProductTypeShowContent = () => {
  const record = useRecordContext<SystemOperatorProductTypeRecord>();
  const translateEnum = useTranslateEnum();
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canEdit = !!permissions?.allow(
    "system_operator_product_type",
    "update",
  );
  const canReadEvents = !!permissions?.allow("event", "read");

  if (!record) {
    return null;
  }

  const statusLabel = translateEnum(
    `system_operator_product_type.status.${record.status}`,
  );
  const statusVariant =
    partyStatusVariantMap[record.status as keyof typeof partyStatusVariantMap];

  const fmt = (d?: string | null) =>
    d ? formatDate(d, "dd.MM.yyyy HH:mm") : undefined;

  const soptId = record.system_operator_product_type_id ?? record.id;
  const eventsFilter = encodeURIComponent(
    JSON.stringify({ "source@eq": `/system_operator_product_type/${soptId}` }),
  );

  const summary: ResourceSummaryField[] = [
    { labelKey: "system_operator_product_type.status", value: statusLabel },
    {
      labelKey: "system_operator_product_type_history.recorded_at",
      value: fmt(record.recorded_at),
    },
    {
      labelKey: "system_operator_product_type_history.recorded_by",
      value: <IdentityField source={fields.recorded_by.source} />,
      valueAs: "div",
    },
    {
      labelKey: "system_operator_product_type_history.replaced_at",
      value: fmt(record.replaced_at),
      shouldShow: !!record.replaced_at,
    },
    {
      labelKey: "system_operator_product_type_history.replaced_by",
      value: <IdentityField source={fields.replaced_by.source} />,
      valueAs: "div",
      shouldShow: record.replaced_by != null,
    },
  ];

  return (
    <ResourceShowLayout
      mainHeaderText={`System operator product type #${record.system_operator_product_type_id ?? record.id}`}
      secondaryHeaderText={`Record #${record.id}`}
      status={
        statusVariant
          ? {
              status: statusVariant.status,
              icon: statusVariant.icon,
              label: statusLabel,
            }
          : undefined
      }
      moreActions={[
        {
          to: `/system_operator_product_type/${soptId}/edit`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit && record.system_operator_product_type_id == null,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.events"),
          shouldShow: canReadEvents,
        },
      ]}
      summary={summary}
      content={<SystemOperatorProductTypeShowTabs />}
    />
  );
};

export const SystemOperatorProductTypeShow = () => (
  <ShowBase
    loading={<Loader />}
    error={<BodyText>Something went wrong</BodyText>}
  >
    <SystemOperatorProductTypeShowContent />
  </ShowBase>
);
