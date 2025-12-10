import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  AccountingPoint,
  AccountingPointBalanceResponsibleParty,
  ControllableUnitServiceProvider,
  Party,
} from "../../../generated-client";
import { LabelValue } from "./LabelValue";

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
  controllableUnitId,
  serviceProvider,
  controllableUnitServiceProvider,
  balanceResponsibleParty,
  controllableUnitBalanceResponsibleParty,
  accountingPoint,
  systemOperator,
}: {
  controllableUnitId: string | undefined;
  serviceProvider: Party | undefined;
  controllableUnitServiceProvider: ControllableUnitServiceProvider | undefined;
  balanceResponsibleParty: Party | undefined;
  controllableUnitBalanceResponsibleParty:
    | AccountingPointBalanceResponsibleParty
    | undefined;
  accountingPoint: AccountingPoint | undefined;
  systemOperator: Party | undefined;
}) => {
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
        label="Accounting point"
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
          label="Service provider"
          value={
            serviceProvider
              ? `${serviceProvider?.name} (${serviceProviderRange})`
              : "No service provider"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnitId}/service_provider`}
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
          label="Balance responsible party"
          value={
            balanceResponsibleParty
              ? `${balanceResponsibleParty?.name} (${balanceResponsiblePartyRange})`
              : "No balance responsible party"
          }
        />
        <Link
          to={`/controllable_unit/${controllableUnitId}/balance_responsible_party`}
          component={RouterLink}
        >
          See previous balance responsible parties
        </Link>
      </Box>
    </Box>
  );
};
