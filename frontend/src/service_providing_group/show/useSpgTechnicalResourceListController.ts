import { useTranslate } from "ra-core";
import { useSearchParams } from "react-router-dom";
import { useTranslateEnum } from "../../intl/intl";
import { EnumLabel } from "../../intl/enum-labels";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { useSpgTechnicalResources } from "./useSpgTechnicalResources";

// Controller/logic layer: owns data fetching, selection state, and
// translated labels/formatters. Returns plain data/functions only � no
// JSX, no UI component imports. The presentational component builds the
// column definitions (and any DS components they render) from these
// values.
export const useSpgTechnicalResourceListController = (
  spgId: number,
  powerScale: Scale,
) => {
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading } = useSpgTechnicalResources(spgId);

  const selectedTechnicalResourceId = (() => {
    const value = searchParams.get("technical_resource");
    const id = value ? Number(value) : NaN;
    return Number.isFinite(id) ? id : null;
  })();

  const selectTechnicalResource = (id: number | null) =>
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

  const selectedRecord =
    data?.find((r) => r.id === selectedTechnicalResourceId) ?? null;

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO, powerScale);

  const translateDeviceType = (value: unknown) =>
    translateEnum(`device_type.${value as string}` as EnumLabel);

  const translateCategory = (value: string) =>
    translateEnum(`category.${value}` as EnumLabel);

  const translateTechnology = (value: string) =>
    translateEnum(`technology.${value}` as EnumLabel);

  return {
    rows: data ?? [],
    isLoading,
    selectedRecord,
    selectedTechnicalResourceId,
    selectTechnicalResource,
    formatPower,
    translateDeviceType,
    translateCategory,
    translateTechnology,
    labels: {
      controllableUnitName: translate("text.controllable_unit"),
      name: translate("field.technical_resource.name"),
      maximumActivePower: translate(
        "field.technical_resource.maximum_active_power",
      ),
      deviceType: translate("field.technical_resource.device_type"),
      category: translate("field.technical_resource.category"),
      technology: translate("field.technical_resource.technology"),
    },
  };
};
