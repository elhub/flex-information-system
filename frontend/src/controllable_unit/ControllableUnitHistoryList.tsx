import { useRecordContext, useTranslate } from "ra-core";
import { useParams } from "react-router-dom";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  StatusBadgeField,
  TextField,
} from "../components/EDS-ra/fields";
import { BodyText, Tooltip } from "../components/ui";
import {
  zControllableUnit,
  zControllableUnitHistory,
} from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { cuStatusVariantMap } from "./controllableUnitStatus";
import { RegulationDirectionField } from "./RegulationDirectionField";
import { AccountingPointLinkField } from "../accounting_point/AccountingPointLinkField";

const IsSmallField = ({ source: _source }: { source: string }) => {
  const record = useRecordContext();
  const translate = useTranslate();
  const isSmall: boolean | undefined = record?.is_small;

  if (isSmall == null) return null;

  const key = isSmall
    ? "controllable_unit.is_small.true"
    : "controllable_unit.is_small.false";
  const labelKey = isSmall
    ? "controllable_unit.is_small.true.label"
    : "controllable_unit.is_small.false.label";

  return (
    <Tooltip content={translate(`text.${key}`)}>
      <span>
        <BodyText size="small">{translate(`text.${labelKey}`)}</BodyText>
      </span>
    </Tooltip>
  );
};

export const ControllableUnitHistoryList = () => {
  const { controllable_unit_id } = useParams();

  const fields = getFields(zControllableUnit.shape);
  const historyFields = getFields(zControllableUnitHistory.shape);

  return (
    <List
      resource="controllable_unit_history"
      filter={{ controllable_unit_id }}
      perPage={25}
      sort={{ field: "recorded_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid rowClick={false}>
        <TextField {...fields.id} />
        <TextField {...fields.name} weight="semibold" />
        <DateField {...fields.start_date} />
        <RegulationDirectionField source={fields.regulation_direction.source} />
        <IsSmallField source={fields.is_small.source} />
        <AccountingPointLinkField
          source={fields.accounting_point_id.source}
        />
        <StatusBadgeField
          source={fields.status.source}
          enumKey="controllable_unit.status"
          variantMap={cuStatusVariantMap}
        />
        <DateField {...fields.recorded_at} showTime />
        <DateField {...historyFields.replaced_at} showTime />
      </Datagrid>
    </List>
  );
};
