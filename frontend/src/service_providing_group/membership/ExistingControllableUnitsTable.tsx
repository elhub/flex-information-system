import { Button, Loader } from "../../components/ui";
import {
  useControllableUnitsInSpg,
  useRemoveMembership,
} from "./useSpgMemberships";
import { SimpleTable } from "../../components/SimpleTable";
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

  if (isLoading) return <Loader />;

  return (
    <>
      <SimpleTable
        size="small"
        data={controllableUnits ?? []}
        empty="No controllable units in this group yet."
        action={{
          render: (row) => (
            <DeleteButton membershipId={row.membershipId} spgId={spgId} />
          ),
          header: "",
        }}
        columns={[
          { key: "id", header: "CU ID" },
          { key: "name", header: "Name" },
          { key: "status", header: "Status" },
          { key: "start_date", header: "Start date" },
        ]}
      />
    </>
  );
};
