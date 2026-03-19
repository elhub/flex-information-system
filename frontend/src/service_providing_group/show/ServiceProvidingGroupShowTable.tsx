import { BodyText, Loader } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  useSpgShowViewModel,
  type SpgMembershipRow,
} from "./useSpgShowViewModel";
import { useNavigate } from "react-router-dom";

type Props = {
  spgId: number;
};

export const ServiceProvidingGroupShowTable = ({ spgId }: Props) => {
  const { data, isLoading } = useSpgShowViewModel(spgId);
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  if (data?.rows.length === 0) {
    return <BodyText>No controllable units in this group yet.</BodyText>;
  }

  const columns: Column<SpgMembershipRow>[] = [
    { key: "controllableUnitName", header: "Controllable unit name" },
    { key: "validFrom", header: "Valid from" },
    {
      key: "validTo",
      header: "Valid to",
    },
    {
      key: "capacityKw",
      header: "Capacity (kW)",
      render: (value) => <div className="text-right">{String(value)}</div>,
    },
    { key: "direction", header: "Direction" },
    { key: "mpid", header: "MPID" },
  ];

  return (
    <div>
      <SimpleTable
        rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
        size="small"
        data={data?.rows ?? []}
        columns={columns}
        className="w-full"
      />
    </div>
  );
};
