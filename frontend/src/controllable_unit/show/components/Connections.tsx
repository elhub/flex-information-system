import { Box, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { LabelValue } from "../../../components/LabelValue";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";

const formatRange = (start: string | undefined, end: string | undefined) => {
  if (!start) {
    return undefined;
  }

  if (!end) {
    return `${new Date(start).toLocaleDateString("no-NB")} - present`;
  }

  return `${new Date(start).toLocaleDateString("no-NB")} - ${new Date(end).toLocaleDateString("no-NB")}`;
};

export const Connections = ({
  controllableUnitViewModel,
}: {
  controllableUnitViewModel: ControllableUnitShowViewModel;
}) => {
  const {
    controllableUnit,
    serviceProvider,
    controllableUnitServiceProvider,
    balanceResponsibleParty,
    accountingPoint,
    systemOperator,
  } = controllableUnitViewModel;
  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );

  return (
    <Box>
      <LabelValue
        label="Accounting point"
        value={`${accountingPoint?.business_id} (${systemOperator?.name})`}
      />
      <Stack direction="row" spacing={1} alignItems="center">
        <LabelValue
          label="Service provider"
          value={
            serviceProvider
              ? `${serviceProvider?.name} (${serviceProviderRange})`
              : "No service provider"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnit.id}/service_provider`}
          component={RouterLink}
        >
          See all contracts
        </Link>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <LabelValue
          labelKey="accounting_point_balance_responsible_party.balance_responsible_party_id"
          value={
            balanceResponsibleParty
              ? `${balanceResponsibleParty?.name}`
              : "No balance responsible party"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnit.id}/balance_responsible_party`}
          component={RouterLink}
        >
          See all balance responsible parties
        </Link>
      </Stack>
    </Box>
  );
};
