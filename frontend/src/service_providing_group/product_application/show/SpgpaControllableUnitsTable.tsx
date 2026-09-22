import {
  BodyText,
  FormItem,
  FormItemLabel,
  Loader,
  Search,
  Switch,
} from "../../../components/ui";
import { Column, SimpleTable } from "../../../components/SimpleTable";
import {
  type SpgpaControllableUnitRow,
  useSpgpaControllableUnits,
} from "./useSpgpaControllableUnits";
import { useTranslate } from "ra-core";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslateField } from "../../../intl/intl";
import { IconCross, IconValidationCheck } from "@elhub/ds-icons";
import { RegulationDirectionIcon } from "../../../controllable_unit/RegulationDirectionField";
import {
  ControllableUnitRegulationDirection,
  ServiceProvidingGroupProductApplication,
} from "../../../generated-client";
import { formatScaled, KILO, Scale } from "../../../utils/scales";
import { toDateTimeString } from "../../../util";

type Props = {
  spgId: number;
  spgpa: ServiceProvidingGroupProductApplication;
  powerScale: Scale;
};

export const SpgpaControllableUnitsTable = ({
  spgId,
  spgpa,
  powerScale,
}: Props) => {
  const { data, isLoading, error } = useSpgpaControllableUnits(spgId, spgpa);
  const navigate = useNavigate();
  const t = useTranslateField();
  const translate = useTranslate();
  const [searchQuery, setSearchQuery] = useState("");
  const [hidePrequalified, setHidePrequalified] = useState(false);
  const filteredCUs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = data?.rows;
    if (q) {
      result = result?.filter(
        (cu) =>
          cu.name?.toLowerCase().includes(q) ||
          (cu.id != null && String(cu.id).includes(q)) ||
          (cu.mpid != null && String(cu.mpid).includes(q)),
      );
    }
    if (hidePrequalified) {
      result = result?.filter(
        (cu) => !cu.gridPrequalifiedAt || !cu.productApplicationPrequalifiedAt,
      );
    }
    return result;
  }, [searchQuery, hidePrequalified, data?.rows]);

  const formatPower = (value: unknown) =>
    formatScaled(Number(value), "W", KILO, powerScale);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    throw error;
  }

  if (!data || data.rows.length === 0) {
    return <BodyText>No controllable units in this group yet.</BodyText>;
  }

  const columns: Column<SpgpaControllableUnitRow>[] = [
    {
      key: "name",
      header: t("controllable_unit.name"),
    },
    {
      key: "membershipRecordedAt",
      header: translate("text.spg_manage_members_column_record_time"),
      render: (value) => <BodyText>{toDateTimeString(String(value))}</BodyText>,
    },

    {
      key: "maximum_active_power",
      header: t("controllable_unit.maximum_active_power"),
      render: (value) => <div className="text-right">{formatPower(value)}</div>,
    },
    {
      key: "mpid",
      header: t("controllable_unit.accounting_point_id"),
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
      key: "regulation_direction",
      header: t("controllable_unit.regulation_direction"),
      render: (value) =>
        value ? (
          <RegulationDirectionIcon
            value={value as ControllableUnitRegulationDirection}
          />
        ) : null,
    },
    {
      key: "gridPrequalifiedAt",
      header: translate("text.table.header.grid_prequalification"),
      render: (value) =>
        value ? (
          <IconValidationCheck
            style={{ width: 18, height: 18 }}
            className="text-semantic-text-success"
            aria-hidden
          />
        ) : (
          <IconCross
            style={{ width: 18, height: 18 }}
            className="text-semantic-text-error"
            aria-hidden
          />
        ),
    },
    {
      key: "productApplicationPrequalifiedAt",
      header: translate("text.table.header.product_application"),
      render: (value) =>
        value ? (
          <IconValidationCheck
            style={{ width: 18, height: 18 }}
            className="text-semantic-text-success"
            aria-hidden
          />
        ) : (
          <IconCross
            style={{ width: 18, height: 18 }}
            className="text-semantic-text-error"
            aria-hidden
          />
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="w-1/2">
            <Search
              label={translate("text.spg_show_table_search_label")}
              hideLabel
              clearButtonLabel={translate("text.spg_show_table_search_clear")}
              placeholder={translate("text.spg_show_table_search_placeholder")}
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
          <FormItem id="hide-prequalified">
            <FormItemLabel>
              {translate("text.spgpa_hide_prequalified")}
            </FormItemLabel>
            <Switch
              checked={hidePrequalified}
              onChange={(e) => setHidePrequalified(e.target.checked)}
            />
          </FormItem>
        </div>
      </div>
      <SimpleTable
        rowClick={(row) => navigate(`/controllable_unit/${row.id}/show`)}
        size="small"
        data={filteredCUs ?? []}
        columns={columns}
        className="w-full"
      />
    </div>
  );
};
