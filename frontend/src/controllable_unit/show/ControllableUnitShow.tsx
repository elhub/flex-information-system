import {
  Loading,
  Show,
  SimpleShowLayout,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Stack } from "@mui/material";
import {
  ControllableUnit,
  ControllableUnitHistoryResponse,
} from "../../generated-client";
import { useControllableUnitViewModel } from "./useControllableUnitViewModel";
import { useParams } from "react-router-dom";
import { Header } from "./components/Header";
import { Connections } from "./components/Connections";
import { TechnicalResources } from "./components/TechnicalResources";
import { TechnicalInformation } from "./components/TechnicalInformation";
import { GridValidation } from "./components/GridValidation";
import { MetaInfo } from "./components/MetaInfo";
import { ControllableUnitShowActions } from "./ControllableUnitShowActions";
import { ControllableUnitAlerts } from "./components/ControllableUnitAlerts";

const Layout = () => {
  const record = useRecordContext<
    ControllableUnit | ControllableUnitHistoryResponse
  >();
  const {
    data: controllableUnitViewModel,
    isPending,
    error,
  } = useControllableUnitViewModel(record);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return "error";
  }

  return (
    <SimpleShowLayout>
      <Stack direction="column" spacing={4}>
        <Header controllableUnit={controllableUnitViewModel.controllableUnit} />
        <ControllableUnitAlerts
          controllableUnitViewModel={controllableUnitViewModel}
        />

        <Connections controllableUnitViewModel={controllableUnitViewModel} />
        <TechnicalResources
          technicalResources={controllableUnitViewModel.technicalResources}
        />

        <TechnicalInformation
          controllableUnit={controllableUnitViewModel.controllableUnit}
        />

        <GridValidation
          controllableUnit={controllableUnitViewModel.controllableUnit}
        />

        <MetaInfo
          controllableUnit={controllableUnitViewModel.controllableUnit}
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
