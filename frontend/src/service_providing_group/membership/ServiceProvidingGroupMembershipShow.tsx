import { IconPencil } from "@elhub/ds-icons";
import {
  ShowBase,
  useGetOne,
  usePermissions,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Permissions } from "../../auth/permissions";
import { BodyText, Loader } from "../../components/ui";
import { ResourceShowLayout } from "../../components/ResourceShowLayout";
import { ServiceProvidingGroupMembershipHistory } from "../../generated-client";
import { useServiceProvidingGroupMembershipShowSummary } from "./ServiceProvidingGroupMembershipShowSummary";
import { ServiceProvidingGroupMembershipShowTabs } from "./ServiceProvidingGroupMembershipShowTabs";

const ServiceProvidingGroupMembershipShowContent = () => {
  const record = useRecordContext<ServiceProvidingGroupMembershipHistory>();
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();

  const { data: controllableUnit } = useGetOne(
    "controllable_unit",
    { id: record?.controllable_unit_id },
    { enabled: !!record?.controllable_unit_id },
  );
  const { data: serviceProvidingGroup } = useGetOne(
    "service_providing_group",
    { id: record?.service_providing_group_id },
    { enabled: !!record?.service_providing_group_id },
  );
  const summary = useServiceProvidingGroupMembershipShowSummary({
    membership: record,
  });

  if (!record) return null;

  // History records point to the membership they belong to.
  const isHistoryRecord = record.service_providing_group_membership_id != null;
  const membershipId =
    record.service_providing_group_membership_id ?? record.id;

  const canEdit =
    (permissions?.allow("service_providing_group_membership", "update") ??
      false) &&
    !isHistoryRecord;
  const canViewHistory =
    permissions?.allow("service_providing_group_membership_history", "read") ??
    false;
  const canReadEvents = permissions?.allow("event", "read") ?? false;

  const historyFilter = encodeURIComponent(
    JSON.stringify({ service_providing_group_membership_id: membershipId }),
  );
  const eventsFilter = encodeURIComponent(
    JSON.stringify({
      "subject@eq": `/service_providing_group_membership/${membershipId}`,
    }),
  );

  return (
    <ResourceShowLayout
      secondaryHeaderText={`${translate(
        "text.service_providing_group_membership",
      )} #${membershipId}`}
      mainHeaderText={
        controllableUnit && serviceProvidingGroup
          ? `${serviceProvidingGroup.name} - ${controllableUnit.name}`
          : (serviceProvidingGroup?.name ?? controllableUnit?.name ?? "")
      }
      moreActions={[
        {
          to: `/service_providing_group/${record.service_providing_group_id}/membership/${membershipId}`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/service_providing_group/${record.service_providing_group_id}/membership_history?filter=${historyFilter}`,
          title: translate("text.cu_spg_show_history"),
          shouldShow: canViewHistory,
        },
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.events"),
          shouldShow: canReadEvents,
        },
      ]}
      summary={summary}
      content={
        <ServiceProvidingGroupMembershipShowTabs
          controllableUnit={controllableUnit}
          controllableUnitId={record.controllable_unit_id}
          serviceProvidingGroup={serviceProvidingGroup}
          serviceProvidingGroupId={record.service_providing_group_id}
        />
      }
    />
  );
};

export const ServiceProvidingGroupMembershipShow = () => (
  <ShowBase
    loading={<Loader />}
    error={<BodyText>Something went wrong</BodyText>}
  >
    <ServiceProvidingGroupMembershipShowContent />
  </ShowBase>
);
