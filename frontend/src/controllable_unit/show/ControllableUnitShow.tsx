import {
  Loading,
  Show,
  SimpleShowLayout,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Box, Stack } from "@mui/material";
import {
  ControllableUnit,
  ControllableUnitHistory,
} from "../../generated-client";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useParams } from "react-router-dom";
import { Header } from "./components/Header";
import { Connections } from "./components/Connections";
import { TechnicalInformation } from "./components/TechnicalInformation";
import { GridValidation } from "./components/GridValidation";
import { ControllableUnitShowActions } from "./ControllableUnitShowActions";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";
import { LabelValue } from "../../components/LabelValue";
import { TechnicalResourceList } from "../technical_resource/TechnicalResourceList";

const Layout = () => {
  const record = useRecordContext<ControllableUnit | ControllableUnitHistory>();
  const {
    data: controllableUnitViewModel,
    isPending,
    error,
  } = useControllableUnitViewModel(record);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    // This is catched by the React Admin Error Boundary
    throw error;
  }

  return (
    <SimpleShowLayout>
      <Stack direction="column" spacing={4}>
        <Header
          controllableUnit={controllableUnitViewModel?.controllableUnit}
        />
        <ControllableUnitAlerts
          controllableUnitViewModel={controllableUnitViewModel}
        />

        <Connections controllableUnitViewModel={controllableUnitViewModel} />

        <Box sx={{ maxWidth: "1000px" }}>
          <TechnicalResourceList />
        </Box>

        <TechnicalInformation
          controllableUnit={controllableUnitViewModel?.controllableUnit}
        />

        <GridValidation
          controllableUnit={controllableUnitViewModel?.controllableUnit}
        />

        <LabelValue
          color="text.secondary"
          labelKey="controllable_unit.recorded_at"
          value={
            controllableUnitViewModel?.controllableUnit?.recorded_at
              ? new Date(
                  controllableUnitViewModel?.controllableUnit?.recorded_at,
                ).toLocaleString()
              : undefined
          }
        />
      </Stack>
    </SimpleShowLayout>
  );
};

export const ControllableUnitShow = () => {
  const resource = useResourceContext();
  const isHistory = !!resource?.endsWith("_history");
  const { id } = useParams<{ id: string }>();

  return (
    <Show
      actions={
        <ControllableUnitShowActions
          controllableUnitId={id}
          isHistory={isHistory}
        />
      }
    >
      <Layout />
    </Show>
  );
};
