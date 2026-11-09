import { useTranslate } from "ra-core";
import { ResourceCard } from "../../components/ResourceCard";
import { Tabs } from "../../components/ui";
import { useTabSearchParam } from "../../hooks/useTabSearchParam";
import type {
  ControllableUnit,
  ServiceProvidingGroup,
} from "../../generated-client";

type Props = {
  controllableUnit: ControllableUnit | undefined;
  controllableUnitId: number;
  serviceProvidingGroup: ServiceProvidingGroup | undefined;
  serviceProvidingGroupId: number;
};

export const ServiceProvidingGroupMembershipShowTabs = ({
  controllableUnit,
  controllableUnitId,
  serviceProvidingGroup,
  serviceProvidingGroupId,
}: Props) => {
  const translate = useTranslate();
  const [tab, setTab] = useTabSearchParam("overview");

  return (
    <Tabs value={tab} onChange={setTab}>
      <Tabs.List>
        <Tabs.Tab label={translate("text.tab.overview")} value="overview" />
      </Tabs.List>
      <Tabs.Panel value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <ResourceCard
            title={translate("text.service_providing_group")}
            content={[
              {
                labelKey: "service_providing_group.name",
                value: serviceProvidingGroup?.name,
              },
            ]}
            to={`/service_providing_group/${serviceProvidingGroupId}/show`}
            linkText={translate("text.resource_card.see_group")}
          />
          <ResourceCard
            title={translate("text.controllable_unit")}
            content={[
              {
                labelKey: "controllable_unit.name",
                value: controllableUnit?.name,
              },
            ]}
            to={`/controllable_unit/${controllableUnitId}/show`}
            linkText={translate("text.resource_card.see_controllable_unit")}
          />
        </div>
      </Tabs.Panel>
    </Tabs>
  );
};
