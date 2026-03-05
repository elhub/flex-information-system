import { Button, Loader } from "../../components/ui";
import {
  useControllableUnitsInSpg,
  useRemoveMembership,
} from "./useSpgMemberships";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { useConfirmAction } from "../../components/ConfirmAction";

type Props = {
  spgId: number;
};

const DeleteButton = ({
  membershipId,
  spgId,
}: {
  membershipId: number;
  spgId: number;
}) => {
  const { mutate: removeMembership } = useRemoveMembership(spgId);
  const { buttonProps, dialog } = useConfirmAction({
    title: "Delete",
    content:
      "Are you sure you want to delete this item? This action cannot be undone.",
    onConfirmMutation: {
      mutationFn: async () => removeMembership(membershipId),
    },
  });

  return (
    <>
      <Button variant="caution" onClick={() => buttonProps.onClick()}>
        Remove
      </Button>
      {dialog}
    </>
  );
};

export const ExistingControllableUnitsTable = ({ spgId }: Props) => {
  const { data: controllableUnits, isLoading } =
    useControllableUnitsInSpg(spgId);

  const columns: ColumnOf<typeof controllableUnits>[] = [
    { key: "id", header: "CU ID" },
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
    <>
      <SimpleTable
        size="small"
        data={controllableUnits ?? []}
        empty="No controllable units in this group yet."
        action={{
          render: (row) => (
            <DeleteButton membershipId={row.membershipId!} spgId={spgId} />
          ),
          header: "",
        }}
        columns={columns}
      />
    </>
  );
};
