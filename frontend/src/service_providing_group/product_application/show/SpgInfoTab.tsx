import { Loader, Badge, Link, Panel } from "../../../components/ui";
import { LabelValue } from "../../../components/LabelValue";
import { useTranslateEnum } from "../../../intl/intl";
import { spgStatusVariantMap } from "../../serviceProvidingGroupStatus";
import { Link as RouterLink } from "react-router-dom";
import { ServiceProvidingGroup } from "../../../generated-client";
import { useSpgShowViewModel } from "../../show/useSpgShowViewModel";

type Props = {
    spgId: number;
    spg: ServiceProvidingGroup | undefined;
};

export const SpgInfoTab = ({ spgId, spg }: Props) => {
    const { data: spgViewModel, isPending, error } = useSpgShowViewModel(spgId);
    const translateEnum = useTranslateEnum();

    if (!spg || isPending) {
        return <Loader size="small" />;
    }

    if (error) throw error;

    const { status, icon } = spgStatusVariantMap[spg.status];

    return (
        <Panel border className="flex flex-col gap-4 p-4">
            <LabelValue
                label="Name"
                value={
                    <div className="flex items-center gap-2">
                        {spg.name}
                        <Link as={RouterLink} to={`/service_providing_group/${spg.id}/show`}>
                            See more
                        </Link>
                    </div>
                }
            />
            <LabelValue label="Bidding zone" value={spg.bidding_zone} />
            <LabelValue
                label="Status"
                value={
                    <Badge size="small" status={status} variant="block" icon={icon}>
                        {translateEnum(`service_providing_group.status.${spg.status}`)}
                    </Badge>
                }
            />
            <LabelValue
                label="Total capacity"
                value={spgViewModel?.totalCapacityKw}
                unit="kW"
            />
            <LabelValue
                label="Capacity - Production"
                value={spgViewModel?.productionCapacityKw}
                unit="kW"
            />
            <LabelValue
                label="Capacity - Consumption"
                value={spgViewModel?.consumptionCapacityKw}
                unit="kW"
            />
        </Panel>
    );
};
