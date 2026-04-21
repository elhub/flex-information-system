export type NoticeGroup = {
    id: string;
    label: string;
    description: string;
    action: string;
    type: "Inconcistency" | "Application"
}


export const noticeGroups: NoticeGroup[] = [
    {
        id: "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract",
        label: "CUSP valid while end user is not valid on the AP",
        description: "CUSP valid while end user is not valid on the AP",
        action: "Update CUSP to match the updated end user data from Elhub",
        type: "Inconcistency",
    },
    {
        id: "no.elhub.flex.service_provider_product_application.status.requested",
        label: "SP product application status requested",
        description: "SP product application status requested",
        action: "Initiate SP product qualification and update status",
        type: "Application",
    },
    {
        id: "no.elhub.flex.service_providing_group.balance_responsible_party.multiple",
        label: "Multiple BRPs in a single SPG",
        description: "Multiple BRPs in a single SPG",
        action: "Make sure the SPG only contains CU currently associated to the same BRP on their accounting point",
        type: "Inconcistency",
    },
    {
        id: "no.elhub.flex.service_providing_group_grid_prequalification.status.requested",
        label: "SPG grid prequalification status requested",
        description: "SPG grid prequalification status requested",
        action: "Initiate SPG grid prequalification and update status",
        type: "Application",
    },
    {
        id: "no.elhub.flex.service_providing_group_membership.valid_time.outside_contract",
        label: "SPG contains expired CU(s)",
        description: "SPG contains expired CU(s)",
        action: "Validate and update SPG membership",
        type: "Inconcistency",
    },
    {
        id: "no.elhub.flex.service_providing_group_membership.bidding_zone_mismatch",
        label: "The CUs bidding zone does not match the one on the SPG",
        description: "The CUs bidding zone does not match the one on the SPG",
        action: "End or update the valid time on the SPG membership",
        type: "Inconcistency",
    },
    {
        id: "no.elhub.flex.service_providing_group_product_application.status.requested",
        label: "SPG product application status requested",
        description: "SPG product application status requested",
        action: "Initiate SPG product prequalification and update status",
        type: "Application",
    },
];

export const applicationTypes = noticeGroups
    .filter((g) => g.type === "Application")
    .map((g) => g.id);

export const inconsistencyTypes = noticeGroups
    .filter((g) => g.type === "Inconcistency")
    .map((g) => g.id);

export const getNoticeGroupLabel = (
    typeId: string,
): string => {
    const group = noticeGroups.find(
        (g) => g.id === typeId,
    );
    return group?.label ?? typeId;
};
