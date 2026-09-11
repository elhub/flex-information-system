import { useState } from "react";
import { formatISO, parseISO } from "date-fns";
import { tz } from "@date-fns/tz";
import { useTranslate } from "ra-core";
import { IconMinus, IconPencil, IconPlus } from "@elhub/ds-icons";
import {
  BodyText,
  DateTimePicker,
  FormItem,
  FormItemLabel,
  Loader,
  Switch,
  Table,
} from "../../components/ui";
import { SpgChangeRow, useSpgChangesViewModel } from "./useSpgChangesViewModel";
import { formatScaled, KILO, Scale } from "../../utils/scales";
import { cn, toDateString } from "../../util";

type Props = {
  spgId: number;
  spgCreatedAt: string | undefined;
  powerScale: Scale;
};

const OSLO_TIMEZONE = "Europe/Oslo";

const rowClassName = (status: SpgChangeRow["status"]) => {
  switch (status) {
    case "added":
      return "bg-semantic-background-success";
    case "removed":
      return "bg-semantic-background-error";
    case "changed":
      return "bg-semantic-background-information";
    default:
      return undefined;
  }
};

const StatusMarker = ({ status }: { status: SpgChangeRow["status"] }) => {
  if (status === "added") {
    return <IconPlus className="text-semantic-text-success" />;
  }
  if (status === "removed") {
    return <IconMinus className="text-semantic-text-error" />;
  }
  if (status === "changed") {
    return <IconPencil className="text-semantic-text-information" />;
  }
  return null;
};

const DiffText = ({
  oldValue,
  newValue,
  status,
}: {
  oldValue: string | undefined;
  newValue: string | undefined;
  status: SpgChangeRow["status"];
}) => {
  if (status === "added") {
    return <span className="text-semantic-text-success">{newValue}</span>;
  }
  if (status === "removed") {
    return <span className="text-semantic-text-error">{oldValue}</span>;
  }
  if (status === "changed" && oldValue !== newValue) {
    return (
      <span>
        <span className="text-semantic-text-error line-through mr-1">
          {oldValue}
        </span>
        <span className="text-semantic-text-success">{newValue}</span>
      </span>
    );
  }
  return <span>{newValue ?? oldValue}</span>;
};

export const ServiceProvidingGroupShowChangesTab = ({
  spgId,
  spgCreatedAt,
  powerScale,
}: Props) => {
  const translate = useTranslate();
  const [asOf, setAsOf] = useState<string | undefined>(spgCreatedAt);
  const [showUnchanged, setShowUnchanged] = useState(false);

  const { data: rows, isLoading, error } = useSpgChangesViewModel(spgId, asOf);
  const visibleRows = rows?.filter(
    (row) => showUnchanged || row.status !== "unchanged",
  );

  const formatPower = (value: number | undefined) =>
    value != null ? formatScaled(value, "W", KILO, powerScale) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 w-fit">
        <BodyText size="small">
          {translate("text.spg_changes_since_label")}
        </BodyText>
        <DateTimePicker
          selected={
            asOf ? parseISO(asOf, { in: tz(OSLO_TIMEZONE) }) : undefined
          }
          onChange={(date) =>
            setAsOf(
              date
                ? formatISO(date, {
                    representation: "complete",
                    in: tz(OSLO_TIMEZONE),
                  })
                : undefined,
            )
          }
          size="large"
          navigateButtons={false}
          fixedPopperPosition
        />
      </div>

      <FormItem id="show-unchanged">
        <FormItemLabel>
          {translate("text.spg_changes_show_unchanged")}
        </FormItemLabel>
        <Switch
          checked={showUnchanged}
          onChange={(e) => setShowUnchanged(e.target.checked)}
        />
      </FormItem>

      {isLoading && <Loader />}
      {error ? (
        <BodyText className="text-semantic-background-action-danger">
          {translate("text.spg_changes_error")}
        </BodyText>
      ) : null}

      {!isLoading && !error && (!visibleRows || visibleRows.length === 0) && (
        <BodyText>{translate("text.spg_changes_empty")}</BodyText>
      )}

      {!isLoading && !error && visibleRows && visibleRows.length > 0 && (
        <Table size="small" className="w-full">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader
                scope="col"
                aria-label={translate("text.spg_changes_column_status")}
              />
              <Table.ColumnHeader scope="col">
                {translate("text.spg_changes_column_id")}
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col">
                {translate("text.spg_changes_column_name")}
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col">
                {translate("text.spg_changes_column_map")}
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col">
                {translate("text.spg_changes_column_valid_from")}
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col">
                {translate("text.spg_changes_column_valid_to")}
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visibleRows.map((row) => (
              <Table.Row key={row.id} className={cn(rowClassName(row.status))}>
                <Table.DataCell>
                  <StatusMarker status={row.status} />
                </Table.DataCell>
                <Table.DataCell>{row.id}</Table.DataCell>
                <Table.DataCell>
                  <DiffText
                    oldValue={row.oldName}
                    newValue={row.newName}
                    status={row.status}
                  />
                </Table.DataCell>
                <Table.DataCell>
                  <DiffText
                    oldValue={formatPower(row.oldMaximumActivePower)}
                    newValue={formatPower(row.newMaximumActivePower)}
                    status={row.status}
                  />
                </Table.DataCell>
                <Table.DataCell>
                  <DiffText
                    oldValue={toDateString(row.oldValidFrom)}
                    newValue={toDateString(row.newValidFrom)}
                    status={row.status}
                  />
                </Table.DataCell>
                <Table.DataCell>
                  <DiffText
                    oldValue={toDateString(row.oldValidTo)}
                    newValue={toDateString(row.newValidTo)}
                    status={row.status}
                  />
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};
