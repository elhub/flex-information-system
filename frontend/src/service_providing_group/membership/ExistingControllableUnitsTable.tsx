import { Button, Loader } from "../../components/ui";
import {
  useControllableUnitsInSpg,
  useRemoveMembership,
} from "./useSpgMemberships";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { useConfirmAction } from "../../components/ConfirmAction";
import { useTranslateField } from "../../intl/intl";

type ControllableUnitsInSpg = NonNullable<
  ReturnType<typeof useControllableUnitsInSpg>["data"]
>;

type Props = {
  spgId: number;
  controllableUnits: ControllableUnitsInSpg | undefined;
  isLoading: boolean;
};

const DeleteButton = ({
  membershipId,
  spgId,
}: {
  membershipId: number;
  spgId: number;
}) => {
  const { mutateAsync: removeMembership } = useRemoveMembership(spgId);
  const { buttonProps, dialog } = useConfirmAction({
    title: "Delete",
    content:
      "Are you sure you want to delete this item? This action cannot be undone.",
    onConfirmMutation: {
      mutationFn: () => removeMembership(membershipId),
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

export const ExistingControllableUnitsTable = ({
  spgId,
  controllableUnits,
  isLoading,
}: Props) => {
  const t = useTranslateField();

  const columns: ColumnOf<typeof controllableUnits>[] = [
    { key: "id", header: t("controllable_unit.id") },
    { key: "name", header: t("controllable_unit.name") },
    {
      key: "accounting_point_business_id",
      header: t("controllable_unit.accounting_point_id"),
    },
    {
      key: "bidding_zone",
      header: t("accounting_point_bidding_zone.bidding_zone"),
      render: (v) => (v as string | undefined) ?? "—",
    },
    {
      key: "brp_name",
      header: t(
        "accounting_point_balance_responsible_party.balance_responsible_party_id",
      ),
      render: (v) => (v as string | undefined) ?? "—",
    },
    { key: "technical_resource_count", header: "Nr. of Technical Resources" },
    {
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
    },
    { key: "status", header: t("controllable_unit.status") },
  ];

  if (isLoading) return <Loader />;

  return (
    <>
      <SimpleTable
        size="small"
        data={controllableUnits ?? []}
        empty="No controllable units in this group yet."
        action={{
          render: (row) =>
            row.membershipId !== undefined ? (
              <DeleteButton membershipId={row.membershipId} spgId={spgId} />
            ) : null,
          header: "",
        }}
        columns={columns}
      />
    </>
  );
};
