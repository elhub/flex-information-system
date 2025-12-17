import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { LabelValue } from "./LabelValue";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";

const formatRange = (start: string | undefined, end: string | undefined) => {
  if (!start) {
    return undefined;
  }

  if (!end) {
    return `${new Date(start).toLocaleDateString()} - present`;
  }

  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
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
    controllableUnitBalanceResponsibleParty,
    accountingPoint,
    systemOperator,
  } = controllableUnitViewModel;
  const serviceProviderRange = formatRange(
    controllableUnitServiceProvider?.valid_from,
    controllableUnitServiceProvider?.valid_to,
  );
  const balanceResponsiblePartyRange = formatRange(
    controllableUnitBalanceResponsibleParty?.valid_from,
    controllableUnitBalanceResponsibleParty?.valid_to,
  );

  return (
    <Box>
      <LabelValue
        label="accounting_point.business_id"
        value={`${accountingPoint?.business_id} (${systemOperator?.name})`}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 1,
        }}
      >
        <LabelValue
          label="controllable_unit_service_provider.id"
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
          See previous contracts
        </Link>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 1,
        }}
      >
        <LabelValue
          label="accounting_point_balance_responsible_party.balance_responsible_party_id"
          value={
            balanceResponsibleParty
              ? `${balanceResponsibleParty?.name} (${balanceResponsiblePartyRange})`
              : "No balance responsible party"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnit.id}/balance_responsible_party`}
          component={RouterLink}
        >
          See previous balance responsible parties
        </Link>
      </Box>
    </Box>
  );
};
