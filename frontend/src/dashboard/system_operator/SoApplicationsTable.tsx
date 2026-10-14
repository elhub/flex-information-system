import { useNavigate } from "react-router-dom";
import { useTranslate } from "ra-core";
import { useTranslateEnum } from "../../intl/intl";
import { EnumLabel } from "../../intl/enum-labels";
import { SimpleTable, Column } from "../../components/SimpleTable";
import {
  ENUM_KEY_PREFIX,
  getDescriptionEnumLabel,
  getStatusVariant,
} from "../shared/dashboardTableUtils";
import { DashboardItem } from "../hooks/useDashboardApplications";
import { toDateTimeString } from "../../util";
import { StatusBadge } from "../../components/StatusBadge";

type Props = {
  label?: string;
  timestampLabel?: string;
  items: DashboardItem[];
  empty?: string | null;
};

export const SOApplicationsTable = ({
  label,
  timestampLabel,
  items,
  empty,
}: Props) => {
  const navigate = useNavigate();
  const translateEnum = useTranslateEnum();
  const translate = useTranslate();

  const columns: Column<DashboardItem>[] = [
    {
      key: "label",
      header: label ?? translate("text.dashboard.application"),
      render: (_, row) => (
        <div>
          <div className="font-medium text-semantic-text">{row.label}</div>
          {row.secondaryLabel && (
            <div className="text-xs text-semantic-text-subtle mt-0.5">
              {row.secondaryLabel}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "serviceProvider",
      header: <span className="hidden sm:inline">Service provider</span>,
      render: (value) => (
        <span className="hidden sm:inline">{String(value ?? "")}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => {
        const variant = getStatusVariant(row.kind, row.status);
        const tooltipLabel = getDescriptionEnumLabel(row.kind, row.status);
        const statusBadgeProperties = {
          label: translateEnum(
            `${ENUM_KEY_PREFIX[row.kind]}.${row.status}` as EnumLabel,
          ),
          status: variant.status,
          icon: variant.icon,
          tooltip: tooltipLabel ? translateEnum(tooltipLabel) : undefined,
        };
        return <StatusBadge {...statusBadgeProperties}></StatusBadge>;
      },
    },
    ...(timestampLabel
      ? [
          {
            key: "timestamp" as const,
            header: timestampLabel,
            render: (value: string | undefined) => toDateTimeString(value),
          },
        ]
      : []),
  ];

  return (
    <SimpleTable
      columns={columns}
      data={items}
      empty={empty}
      className="w-full"
      rowClick={(item) => navigate(item.route)}
    />
  );
};
