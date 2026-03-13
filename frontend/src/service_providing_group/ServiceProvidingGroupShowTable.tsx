import { IconWarningTriangle } from "@elhub/ds-icons";
import { BodyText, Loader } from "../components/ui";
import { Column, SimpleTable } from "../components/SimpleTable";
import { useRecordContext, useTranslate } from "ra-core";
import {
  useSpgShowViewModel,
  type SpgMembershipRow,
} from "./useSpgShowViewModel";

type SpgMembershipTableRow = SpgMembershipRow & {
  statusLabel: string;
};

export const ServiceProvidingGroupShowTable = () => {
  const spgRecord = useRecordContext<{ id: number }>();
  const { data, isLoading } = useSpgShowViewModel(spgRecord);
  const translate = useTranslate();

  if (isLoading) {
    return <Loader />;
  }

  const rows: SpgMembershipTableRow[] = (data?.rows ?? []).map((row) => ({
    ...row,
    statusLabel: translate(`enum.controllable_unit.status.${row.status}`),
  }));

  if (rows.length === 0) {
    return <BodyText>No controllable units in this group yet.</BodyText>;
  }

  const columns: Column<SpgMembershipTableRow>[] = [
    { key: "type", header: "Type" },
    { key: "controllableUnitName", header: "Controllable unit name" },
    { key: "validFrom", header: "Valid from" },
    {
      key: "validTo",
      header: "Valid to",
      render: (value, row) => (
        <div className="inline-flex items-center gap-1.5">
          <span>{String(value)}</span>
          {row.hasWarning ? (
            <span className="text-support-red">
              <IconWarningTriangle />
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "capacityKw",
      header: "Capacity (kW)",
      render: (value) => <div className="text-right">{String(value)}</div>,
    },
    { key: "technicalResourceName", header: "Technical resource name" },
    { key: "direction", header: "Direction" },
    { key: "mpid", header: "MPID" },
    { key: "endUser", header: "End user" },
    { key: "statusLabel", header: "Status" },
  ];

  return (
    <div className="overflow-x-auto rounded-sm border border-border-default">
      <SimpleTable size="small" data={rows} columns={columns} />
    </div>
  );
};
