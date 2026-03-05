import { useState } from "react";
import { Button, Checkbox, Loader } from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";
import {
  useAddMemberships,
  useControllableUnitsNotInSpg,
} from "./useSpgMemberships";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";

type Props = {
  spgId: number;
};

export const FindControllableUnits = ({ spgId }: Props) => {
  const [selectedCuIds, setSelectedCuIds] = useState<number[]>([]);

  const { data: availableCus, isLoading } = useControllableUnitsNotInSpg(spgId);
  const { mutate: addMemberships, isPending: isAdding } =
    useAddMemberships(spgId);

  const allSelected =
    !!availableCus?.length &&
    availableCus.every((cu) => selectedCuIds.includes(cu.id));

  const toggleSelectAll = () => {
    setSelectedCuIds(
      allSelected ? [] : (availableCus?.map((cu) => cu.id) ?? []),
    );
  };

  const toggleCu = (cuId: number) => {
    setSelectedCuIds((prev) =>
      prev.includes(cuId) ? prev.filter((id) => id !== cuId) : [...prev, cuId],
    );
  };

  const handleAdd = () => {
    addMemberships(selectedCuIds, {
      onSuccess: () => setSelectedCuIds([]),
    });
  };

  const columns: ColumnOf<typeof availableCus>[] = [
    { key: "name", header: "Name" },
    { key: "meteringPointBusinessId", header: "Metering Point ID" },
    {
      key: "biddingZone",
      header: "Price Area",
      render: (v) => (v as string | undefined) ?? "—",
    },
    { key: "technicalResourceCount", header: "Nr. of Technical Resources" },
    { key: "maximum_active_power", header: "Total Capacity (kW)" },
    { key: "status", header: "Status" },
  ];

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <SimpleTable
        size="small"
        data={availableCus ?? []}
        empty="No controllable units available to add."
        columns={columns}
        checkbox={{
          render: (row) => (
            <Checkbox
              checked={selectedCuIds.includes(row.id)}
              onChange={() => toggleCu(row.id)}
            />
          ),
          header: <Checkbox checked={allSelected} onChange={toggleSelectAll} />,
        }}
      />
      <div>
        <Button
          icon={IconPlus}
          variant="primary"
          disabled={selectedCuIds.length === 0 || isAdding}
          onClick={handleAdd}
        >
          Add selected CUs to group
        </Button>
      </div>
    </div>
  );
};
