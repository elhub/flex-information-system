import { useState } from "react";
import {
  Alert,
  BodyText,
  Button,
  Checkbox,
  Datepicker,
  FormItem,
  FormItemLabel,
  Link,
  Loader,
  Modal,
} from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";
import {
  useAddMemberships,
  useControllableUnitsNotInSpg,
} from "./useSpgMemberships";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { formatISO, startOfDay } from "date-fns";
import { tz } from "@date-fns/tz";
import { useTranslateField } from "../../intl/intl";

type Props = {
  spgId: number;
};

const toMidnightISO = (date: Date): string =>
  formatISO(date, { representation: "complete", in: tz("Europe/Oslo") });

export const FindControllableUnits = ({ spgId }: Props) => {
  const [selectedCuIds, setSelectedCuIds] = useState<number[]>([]);
  const [failedCUs, setFailedCUs] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validFrom, setValidFrom] = useState<Date>(
    startOfDay(new Date(), { in: tz("Europe/Oslo") }),
  );
  const t = useTranslateField();

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

  const openDialog = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    addMemberships(
      { cuIds: selectedCuIds, validFrom: toMidnightISO(validFrom) },
      {
        // This always succeeds since its a promise.allSettled in the mutation
        onSuccess: (result) => {
          setFailedCUs(result.failed);
          setSelectedCuIds([]);
          setDialogOpen(false);
        },
      },
    );
  };

  const columns: ColumnOf<typeof availableCus>[] = [
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
    {
      key: "technical_resource_count",
      header: "Number of Technical Resources",
    },
    {
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
    },
    { key: "status", header: t("controllable_unit.status") },
  ];

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      {failedCUs.length > 0 && (
        <Alert variant="error">
          {failedCUs.length} controllable unit{failedCUs.length > 1 ? "s" : ""}{" "}
          failed to add
        </Alert>
      )}
      <SimpleTable
        size="small"
        data={availableCus ?? []}
        empty="No controllable units available to add."
        columns={columns}
        action={{
          render: (row) => (
            <Link external href={`#/controllable_unit/${row.id}/show`}>
              See more
            </Link>
          ),
          header: "",
        }}
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
          disabled={selectedCuIds.length === 0}
          onClick={openDialog}
        >
          Add selected CUs to group
        </Button>
      </div>

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-label="Set membership start date"
        className="overflow-visible"
      >
        <Modal.Header
          title="Set membership start date"
          description={`Adding ${selectedCuIds.length} controllable unit${selectedCuIds.length !== 1 ? "s" : ""} to the group.`}
        />
        <Modal.Content>
          <BodyText>
            Choose the date from which the memberships are valid.
          </BodyText>
          <FormItem>
            <FormItemLabel htmlFor="valid-from-picker">
              Valid from
            </FormItemLabel>
            <Datepicker
              id="valid-from-picker"
              selected={validFrom}
              onChange={(date) => date && setValidFrom(date)}
              size="large"
              navigateButtons={false}
            />
          </FormItem>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isAdding}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
