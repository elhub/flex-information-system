import { BodyText, Button, Loader, Search } from "../../components/ui";
import { Column, SimpleTable } from "../../components/SimpleTable";
import {
  type SpgMembershipRow,
  useRemoveMembershipFromShow,
} from "./useSpgShowViewModel";
import { Link as RouterLink } from "react-router-dom";
import { IconCrossCircle, IconUser } from "@elhub/ds-icons";
import { useConfirmAction } from "../../components/ConfirmAction";
import { RegulationDirectionIcon } from "../../controllable_unit/RegulationDirectionField";
import { ControllableUnitRegulationDirection } from "../../generated-client";
import { Scale } from "../../utils/scales";
import { useServiceProvidingGroupShowTableController } from "./useServiceProvidingGroupShowTableController";

type Props = {
  spgId: number;
  powerScale: Scale;
};

// Self-contained row action widget: owns its own mutation + confirmation
// dialog. Kept here (not in the controller hook) because it is a leaf UI
// action, not shared list state.
const DeleteButton = ({
  membershipId,
  spgId,
}: {
  membershipId: number;
  spgId: number;
}) => {
  const { mutateAsync: removeMembership } = useRemoveMembershipFromShow(spgId);
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
      <Button
        variant="invisible"
        className="text-semantic-background-action-danger"
        size="large"
        icon={IconCrossCircle}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          buttonProps.onClick();
        }}
      />
      {dialog}
    </>
  );
};

// Presentational only: no RA imports, no data fetching, no search/filter
// logic, no navigation targets computed here. All of that lives in
// useServiceProvidingGroupShowTableController. This component owns the
// column/JSX definitions since building them requires DS components
// (Button, BodyText, RegulationDirectionIcon), which the hook must not
// import.
export const ServiceProvidingGroupShowTable = ({
  spgId,
  powerScale,
}: Props) => {
  const {
    isLoading,
    error,
    hasNoMembers,
    rows,
    searchQuery,
    setSearchQuery,
    canManageMembers,
    canDelete,
    manageMembersHref,
    goToControllableUnit,
    goToAccountingPoint,
    formatPower,
    labels,
  } = useServiceProvidingGroupShowTableController(spgId, powerScale);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  if (hasNoMembers) {
    return (
      <div className="flex flex-col items-start gap-2">
        <BodyText>No controllable units in this group yet.</BodyText>
        {canManageMembers ? (
          <Button
            as={RouterLink}
            to={manageMembersHref}
            variant="invisible"
            icon={IconUser}
          >
            Manage members
          </Button>
        ) : null}
      </div>
    );
  }

  const columns: Column<SpgMembershipRow>[] = [
    {
      key: "name",
      header: labels.name,
    },
    {
      key: "validFrom",
      header: labels.validFrom,
    },
    {
      key: "validTo",
      header: labels.validTo,
    },
    {
      key: "rated_power",
      header: labels.ratedPower,
      render: (value) => (
        <div className="text-right">
          {value != null ? formatPower(value) : "�"}
        </div>
      ),
    },
    {
      key: "maximum_active_power",
      header: labels.maximumActivePower,
      render: (value) => <div className="text-right">{formatPower(value)}</div>,
    },
    {
      key: "location",
      header: labels.location,
      render: (value, row) => (
        <Button
          variant="secondary"
          onClick={() => goToAccountingPoint(row.accountingPointId)}
        >
          {labels.locationButton}
        </Button>
      ),
    },
    {
      key: "mpid",
      header: labels.mpid,
      render: (value) =>
        value !== "-" ? (
          <BodyText
            size={"small"}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {String(value)}
          </BodyText>
        ) : (
          <>{value}</>
        ),
    },
    {
      key: "brpName",
      header: labels.brpName,
    },
    {
      key: "regulation_direction",
      header: labels.regulationDirection,
      render: (value) =>
        value ? (
          <RegulationDirectionIcon
            value={value as ControllableUnitRegulationDirection}
          />
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex-1 mr-4">
          <Search
            label={labels.searchLabel}
            hideLabel
            clearButtonLabel={labels.searchClear}
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
        {canManageMembers && (
          <Button
            as={RouterLink}
            to={manageMembersHref}
            variant="primary"
            icon={IconUser}
          >
            Manage members
          </Button>
        )}
      </div>
      <SimpleTable
        rowClick={goToControllableUnit}
        size="small"
        data={rows}
        columns={columns}
        className="w-full"
        action={
          canDelete
            ? {
                header: "Remove from group",
                render: (row) =>
                  row.membershipId !== undefined ? (
                    <DeleteButton
                      membershipId={row.membershipId}
                      spgId={spgId}
                    />
                  ) : null,
              }
            : undefined
        }
      />
    </div>
  );
};
