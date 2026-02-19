import { useRecordContext } from "ra-core";
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
import { Show } from "../../components/EDS-ra";
import { Loader } from "../../components/ui";
import { formatDate } from "date-fns";

const Layout = () => {
  const record = useRecordContext<ControllableUnit | ControllableUnitHistory>();
  const {
    data: controllableUnitViewModel,
    isPending,
    error,
  } = useControllableUnitViewModel(record);

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  return (
    <div className="flex flex-col gap-5">
      <Header controllableUnit={controllableUnitViewModel?.controllableUnit} />
      <ControllableUnitAlerts
        controllableUnitViewModel={controllableUnitViewModel}
      />

      <Connections controllableUnitViewModel={controllableUnitViewModel} />

      <div className="max-w-2xl">
        <TechnicalResourceList />
      </div>

      <TechnicalInformation
        controllableUnit={controllableUnitViewModel?.controllableUnit}
      />

      <GridValidation
        controllableUnit={controllableUnitViewModel?.controllableUnit}
      />

      <LabelValue
        labelKey="controllable_unit.recorded_at"
        className="flex gap-2 items-center"
        value={
          controllableUnitViewModel?.controllableUnit?.recorded_at
            ? formatDate(
                controllableUnitViewModel?.controllableUnit?.recorded_at,
                "dd.MM.yyyy HH:mm",
              )
            : undefined
        }
      />
    </div>
  );
};

export const ControllableUnitShow = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Show
      extraActions={<ControllableUnitShowActions controllableUnitId={id} />}
    >
      <Layout />
    </Show>
  );
};
