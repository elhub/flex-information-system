import { useTranslate } from "ra-core";
import { useSearchParams } from "react-router-dom";
import { SimpleTable, ColumnOf } from "../../components/SimpleTable";
import { Tag } from "../../components/ui";
import { useTranslateEnum } from "../../intl/intl";
import { EnumLabel } from "../../intl/enum-labels";
import { TechnicalResourceDetailModal } from "../../controllable_unit/technical_resource/TechnicalResourceDetailModal";
import {
  useSpgTechnicalResources,
  SpgTechnicalResource,
} from "./useSpgTechnicalResources";

type Props = {
  spgId: number;
};

export const SpgTechnicalResourceList = ({ spgId }: Props) => {
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTechnicalResourceId = (() => {
    const value = searchParams.get("technical_resource");
    const id = value ? Number(value) : NaN;
    return Number.isFinite(id) ? id : null;
  })();

  const setSelectedTechnicalResourceId = (id: number | null) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id != null) {
          next.set("technical_resource", String(id));
        } else {
          next.delete("technical_resource");
        }
        return next;
      },
      { replace: true },
    );

  const { data } = useSpgTechnicalResources(spgId);

  const selectedRecord =
    data?.find((r) => r.id === selectedTechnicalResourceId) ?? null;

  const columns: ColumnOf<SpgTechnicalResource[]>[] = [
    {
      key: "controllable_unit_name",
      header: translate("text.controllable_unit"),
    },
    { key: "name", header: translate("field.technical_resource.name") },
    {
      key: "maximum_active_power",
      header: translate("field.technical_resource.maximum_active_power"),
      render: (value) => `${value} kW`,
    },
    {
      key: "device_type",
      header: translate("field.technical_resource.device_type"),
      render: (value) =>
        translateEnum(`device_type.${value as string}` as EnumLabel),
    },
    {
      key: "category",
      header: translate("field.technical_resource.category"),
      render: (value) => (
        <div className="flex gap-2 flex-wrap">
          {(value as SpgTechnicalResource["category"]).map((v) => (
            <Tag key={v}>{translateEnum(`category.${v}` as EnumLabel)}</Tag>
          ))}
        </div>
      ),
    },
    {
      key: "technology",
      header: translate("field.technical_resource.technology"),
      render: (value) => (
        <div className="flex gap-2 flex-wrap">
          {(value as SpgTechnicalResource["technology"]).map((v) => (
            <Tag key={v}>{translateEnum(`technology.${v}` as EnumLabel)}</Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SimpleTable
        columns={columns}
        data={data ?? []}
        rowClick={(record) => {
          setSelectedTechnicalResourceId(record.id);
        }}
      />
      <TechnicalResourceDetailModal
        record={selectedRecord}
        open={selectedTechnicalResourceId !== null}
        onClose={() => setSelectedTechnicalResourceId(null)}
      />
    </div>
  );
};
