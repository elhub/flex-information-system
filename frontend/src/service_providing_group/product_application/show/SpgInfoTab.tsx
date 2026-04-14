import { Loader, Badge, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { useSpgpaSpgData } from "./useSpgpaShowViewModel";
import { useTranslateEnum } from "../../../intl/intl";
import { spgStatusVariantMap } from "../../serviceProvidingGroupStatus";
import { Link as RouterLink } from "react-router-dom";

type Props = {
    spgId: number;
};

export const SpgInfoTab = ({ spgId }: Props) => {
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
