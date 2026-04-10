import { Link as RouterLink } from "react-router-dom";
import { Badge, Link, Loader, Panel, Tabs } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { CommentList } from "../../../components/comments";
import { useSpgpaSpgData } from "./useSpgpaShowViewModel";
import { useTranslateEnum } from "../../../intl/intl";
import { spgStatusVariantMap } from "../../serviceProvidingGroupStatus";
import {
  EventButton,
  NestedResourceHistoryButton,
} from "../../../components/EDS-ra/buttons";

const SpgInfoTab = ({ spgId }: { spgId: number }) => {
  const { spg, viewModel } = useSpgpaSpgData(spgId);
  const translateEnum = useTranslateEnum();

  if (spg.isPending || viewModel.isPending) {
    return <Loader size="small" />;
  }

  if (spg.error) throw spg.error;
  if (!spg.data) return null;

  const { status, icon } = spgStatusVariantMap[spg.data.status];

  return (
    <Panel border className="flex flex-col gap-4 p-4">
      <LabelValue
        label="Name"
        value={
          <Link
            as={RouterLink}
            to={`/service_providing_group/${spg.data.id}/show`}
          >
            {spg.data.name}
          </Link>
        }
      />
      <LabelValue label="Bidding zone" value={spg.data.bidding_zone} />
      <LabelValue
        label="Status"
        value={
          <Badge size="small" status={status} variant="block" icon={icon}>
            {translateEnum(`service_providing_group.status.${spg.data.status}`)}
          </Badge>
        }
      />
      <LabelValue
        label="Total capacity"
        value={viewModel.data?.totalCapacityKw}
        unit="kW"
      />
      <LabelValue
        label="Capacity - Production"
        value={viewModel.data?.productionCapacityKw}
        unit="kW"
      />
      <LabelValue
        label="Capacity - Consumption"
        value={viewModel.data?.consumptionCapacityKw}
        unit="kW"
      />
    </Panel>
  );
};

type Props = {
  spgId: number;
  spgpaId: number;
};

export const SpgpaShowTabs = ({ spgId, spgpaId }: Props) => (
  <>
    <Tabs defaultValue="spg_info" className="relative top-[-24px]">
      <Tabs.List>
        <Tabs.Tab label="SPG info" value="spg_info" />
        <Tabs.Tab label="Comments" value="comments" />
      </Tabs.List>
      <Tabs.Panel value="spg_info">
        <SpgInfoTab spgId={spgId} />
      </Tabs.Panel>
      <Tabs.Panel value="comments">
        <CommentList
          parentPath={[
            { resource: "service_providing_group", id: spgId },
            { resource: "product_application", id: spgpaId },
          ]}
        />
      </Tabs.Panel>
    </Tabs>
    <div className="flex gap-4 mt-2">
      <NestedResourceHistoryButton child="product_application" />
      <EventButton filterOnSubject recordId={String(spgpaId)} />
    </div>
  </>
);
