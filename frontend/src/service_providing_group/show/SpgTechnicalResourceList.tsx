import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { Loader, Tag } from "../../components/ui";
import { TechnicalResourceDetailModal } from "../../controllable_unit/technical_resource/TechnicalResourceDetailModal";
import { Scale } from "../../utils/scales";
import { useSpgTechnicalResourceListController } from "./useSpgTechnicalResourceListController";
import { SpgTechnicalResource } from "./useSpgTechnicalResources";

type Props = {
  spgId: number;
  powerScale: Scale;
};

// Presentational: builds the column definitions (and the DS components they
// render, e.g. Tag) from the plain labels/formatters returned by
// useSpgTechnicalResourceListController, which itself has no UI imports.
export const SpgTechnicalResourceList = ({ spgId, powerScale }: Props) => {
  const {
    rows,
    isLoading,
    selectedRecord,
    selectedTechnicalResourceId,
    selectTechnicalResource,
    formatPower,
    translateDeviceType,
    translateCategory,
    translateTechnology,
    labels,
  } = useSpgTechnicalResourceListController(spgId, powerScale);

  if (isLoading) {
    return <Loader />;
  }

  const columns: ColumnOf<SpgTechnicalResource[]>[] = [
    {
      key: "controllable_unit_name",
      header: labels.controllableUnitName,
    },
    { key: "name", header: labels.name },
    {
      key: "maximum_active_power",
      header: labels.maximumActivePower,
      render: (value) => formatPower(value),
    },
    {
      key: "device_type",
      header: labels.deviceType,
      render: (value) => translateDeviceType(value),
    },
    {
      key: "category",
      header: labels.category,
      render: (value) => (
        <div className="flex gap-2 flex-wrap">
          {(value as SpgTechnicalResource["category"]).map((v) => (
            <Tag key={v}>{translateCategory(v)}</Tag>
          ))}
        </div>
      ),
    },
    {
      key: "technology",
      header: labels.technology,
      render: (value) => (
        <div className="flex gap-2 flex-wrap">
          {(value as SpgTechnicalResource["technology"]).map((v) => (
            <Tag key={v}>{translateTechnology(v)}</Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SimpleTable
        columns={columns}
        data={rows}
        rowClick={(record) => selectTechnicalResource(record.id)}
      />
      <TechnicalResourceDetailModal
        record={selectedRecord}
        open={selectedTechnicalResourceId !== null}
        onClose={() => selectTechnicalResource(null)}
        displayScale={powerScale}
      />
    </div>
  );
};
