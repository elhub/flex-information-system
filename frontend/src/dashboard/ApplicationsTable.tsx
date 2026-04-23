// frontend/src/dashboard/ApplicationsTable.tsx
import { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
    IconCheckCircle,
    IconCrossCircle,
    IconStopWatch15,
    IconWarningCircle,
    SvgIconProps,
} from "@elhub/ds-icons";
import { useTranslateEnum } from "../intl/intl";
import { EnumLabel } from "../intl/enum-labels";
import { SimpleTable, Column } from "../components/SimpleTable";
import { Badge } from "../components/ui";
import { sppaStatusVariantMap } from "../service_provider_product_application/show/sppaStatus";
import { spgpaStatusVariantMap } from "../service_providing_group/product_application/show/spgpaStatus";
import { DashboardItem } from "./useDashboardApplications";

type BadgeVariant = {
    status: string;
    icon: ComponentType<SvgIconProps>;
};

// Grid prequalification statuses don't have a shared variant map yet,
// so we define a minimal one inline.
const spggpStatusVariantMap: Record<string, BadgeVariant> = {
    requested: { status: "pending", icon: IconStopWatch15 },
    in_progress: { status: "ongoing", icon: IconStopWatch15 },
    conditionally_approved: { status: "approved-with-warning", icon: IconWarningCircle },
    approved: { status: "approved", icon: IconCheckCircle },
    not_approved: { status: "rejected", icon: IconCrossCircle },
};

const fallbackVariant: BadgeVariant = { status: "pending", icon: IconStopWatch15 };

type Props = {
    items: DashboardItem[];
};

export const ApplicationsTable = ({ items }: Props) => {
    const navigate = useNavigate();
    const translateEnum = useTranslateEnum();

    const getVariant = (item: DashboardItem): BadgeVariant => {
        if (item.kind === "sp_product_application") {
            return (
                sppaStatusVariantMap[
                    item.status as keyof typeof sppaStatusVariantMap
                ] ?? fallbackVariant
            );
        }
        if (item.kind === "spg_product_application") {
            return (
                spgpaStatusVariantMap[
                    item.status as keyof typeof spgpaStatusVariantMap
                ] ?? fallbackVariant
            );
        }
        return spggpStatusVariantMap[item.status] ?? fallbackVariant;
    };

    const enumKeyPrefix: Record<DashboardItem["kind"], string> = {
        sp_product_application: "service_provider_product_application.status",
        spg_product_application: "service_providing_group_product_application.status",
        spg_grid_prequalification: "service_providing_group_grid_prequalification.status",
    };

    const columns: Column<DashboardItem>[] = [
        {
            key: "typeLabel",
            header: "Type",
            render: (_, row) => (
                <div>
                    <div className="font-medium text-semantic-text">
                        {row.typeLabel}
                    </div>
                    {row.byline && (
                        <div className="text-xs text-semantic-text-subtle mt-0.5">
                            {row.byline}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "participant",
            header: "Participant",
        },
        {
            key: "dueDate",
            header: "Due Date",
        },
        {
            key: "status",
            header: "Status",
            render: (_, row) => {
                const variant = getVariant(row);
                return (
                    <Badge
                        size="small"
                        variant="block"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        status={variant.status as any}
                        icon={variant.icon}
                    >
                        {translateEnum(`${enumKeyPrefix[row.kind]}.${row.status}` as EnumLabel)}
                    </Badge>
                );
            },
        },
    ];

    return (
        <SimpleTable
            columns={columns}
            data={items}
            empty="No pending applications."
            rowClick={(item) => navigate(item.route)}
        />
    );
};
