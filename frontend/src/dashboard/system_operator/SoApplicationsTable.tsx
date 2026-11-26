import { useMemo, useState } from "react";
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
import type { SortState } from "../../components/ui";

type Props = {
  label?: string;
  timestampLabel?: string;
  items: DashboardItem[];
  empty?: string | null;
  // adds the "complete at" and "deadline" columns (SPG product applications)
  showDeadlineColumns?: boolean;
};

// statuses sort in workflow order, unknown statuses last
const STATUS_ORDER = [
  "requested",
  "in_progress",
  "communication_test",
  "prequalification",
];

const DATE_KEYS = new Set<string>(["timestamp", "completeAt", "deadline"]);

const sortValue = (item: DashboardItem, key: string): number | undefined => {
  if (key === "status") {
    const index = STATUS_ORDER.indexOf(item.status);
    return index === -1 ? undefined : index;
  }
  if (DATE_KEYS.has(key)) {
    const value = item[key as "timestamp" | "completeAt" | "deadline"];
    return value ? new Date(value).getTime() : undefined;
  }
  return undefined;
};

export const SOApplicationsTable = ({
  label,
  timestampLabel,
  items,
  empty,
  showDeadlineColumns,
}: Props) => {
  const navigate = useNavigate();
  const translateEnum = useTranslateEnum();
  const translate = useTranslate();
  // oldest first by default, so the table reads as a queue
  const [sort, setSort] = useState<SortState | undefined>({
    orderBy: "timestamp",
    direction: "ascending",
  });

  const sortedItems = useMemo(() => {
    if (!sort) return items;
    const key = String(sort.orderBy);
    const factor = sort.direction === "ascending" ? 1 : -1;

    const rows = items.map((item) => ({ item, value: sortValue(item, key) }));
    const withValue = rows.filter((row) => row.value !== undefined);
    const withoutValue = rows.filter((row) => row.value === undefined);

    withValue.sort((a, b) => factor * (a.value! - b.value!));

    // rows without a value always go last, regardless of direction
    return [...withValue, ...withoutValue].map((row) => row.item);
  }, [items, sort]);

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
      sortable: true,
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
            sortable: true,
            sortType: "date" as const,
            render: (value: string | undefined) => toDateTimeString(value),
          },
        ]
      : []),
    ...(showDeadlineColumns
      ? [
          {
            key: "completeAt" as const,
            header: translate(
              "field.service_providing_group_product_application.complete_at",
            ),
            sortable: true,
            sortType: "date" as const,
            render: (value: string | undefined) => toDateTimeString(value),
          },
          {
            key: "deadline" as const,
            header: translate("text.dashboard.deadline"),
            sortable: true,
            sortType: "date" as const,
            render: (value: string | undefined) => toDateTimeString(value),
          },
        ]
      : []),
  ];

  return (
    <SimpleTable
      columns={columns}
      data={sortedItems}
      sort={sort}
      onSortChange={setSort}
      empty={empty}
      className="w-full"
      rowClick={(item) => navigate(item.route)}
    />
  );
};
