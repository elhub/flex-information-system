import { useState } from "react";
import { Button, Loader, Table } from "../../components/ui";
import { Checkbox } from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";
import {
  useAddMemberships,
  useControllableUnitsNotInSpg,
} from "./useSpgMemberships";

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

  if (isLoading) return <Loader />;

  if (!availableCus?.length) {
    return (
      <p className="text-sm text-gray-500">
        No controllable units available to add.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader scope="col">
              <Checkbox checked={allSelected} onChange={toggleSelectAll} />
            </Table.ColumnHeader>
            <Table.ColumnHeader scope="col">CU ID</Table.ColumnHeader>
            <Table.ColumnHeader scope="col">Name</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {availableCus.map((cu) => (
            <Table.Row key={cu.id}>
              <Table.DataCell>
                <Checkbox
                  checked={selectedCuIds.includes(cu.id)}
                  onChange={() => toggleCu(cu.id)}
                />
              </Table.DataCell>
              <Table.DataCell>{cu.id}</Table.DataCell>
              <Table.DataCell>{cu.name ?? "—"}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
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
