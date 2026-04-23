// frontend/src/dashboard/SpApplicationsTable.tsx
import { useNavigate } from "react-router-dom";
import { useTranslateEnum } from "../intl/intl";
import { EnumLabel } from "../intl/enum-labels";
import { SimpleTable, Column } from "../components/SimpleTable";
import { Badge } from "../components/ui";
import { ENUM_KEY_PREFIX, getStatusVariant } from "./dashboardTableUtils";
import { SpDashboardItem } from "./useSpDashboard";

type Props = {
  items: SpDashboardItem[];
  empty?: string;
};

export const SpApplicationsTable = ({ items, empty = "No applications." }: Props) => {
  const navigate = useNavigate();
  const translateEnum = useTranslateEnum();

  const columns: Column<SpDashboardItem>[] = [
    {
      key: "typeLabel",
      header: "Type",
      render: (_, row) => (
        <div>
          <div className="font-medium text-semantic-text">{row.typeLabel}</div>
          {row.byline && (
            <div className="text-xs text-semantic-text-subtle mt-0.5">
              {row.byline}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "systemOperator",
      header: <span className="hidden sm:inline">System Operator</span>,
      render: (value) => (
        <span className="hidden sm:inline">{String(value ?? "")}</span>
      ),
    },
    {
      key: "dueDate",
      header: <span className="hidden sm:inline">Due Date</span>,
      render: (value) => (
        <span className="hidden sm:inline">{String(value ?? "")}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, row) => {
        const variant = getStatusVariant(row.kind, row.status);
        return (
          <Badge
            size="small"
            variant="block"
            status={variant.status}
            icon={variant.icon}
          >
            {translateEnum(
              `${ENUM_KEY_PREFIX[row.kind]}.${row.status}` as EnumLabel,
            )}
          </Badge>
        );
      },
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      data={items}
      empty={empty}
      rowClick={(item) => navigate(item.route)}
    />
  );
};
