import {
  usePermissions,
  useRecordContext,
  Identifier,
  useTranslate,
} from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { useTypedNavigate, buildPath } from "../../routes";
import { Permissions } from "../../auth/permissions";
import { TechnicalResourceInputLocationState } from "./TechnicalResourceInput";
import {
  TechnicalResource,
  deleteTechnicalResource,
} from "../../generated-client";
import { SimpleTable, ColumnOf } from "../../components/SimpleTable";
import { Button } from "../../components/ui";
import { IconPlus, IconTrash } from "@elhub/ds-icons";
import { useConfirmAction } from "../../components/ConfirmAction";
import { throwOnError } from "../../util";
import { useTechnicalResources } from "./useTechnicalResources";
import { useTranslateEnum } from "../../intl/intl";
import { EnumLabel } from "../../intl/enum-labels";

const CreateButton = ({
  controllableUnitId,
}: {
  controllableUnitId: Identifier;
}) => {
  const locationState: TechnicalResourceInputLocationState = {
    technicalResource: {
      controllable_unit_id: Number(controllableUnitId),
    },
  };
  return (
    <Button
      as={RouterLink}
      to={buildPath("cu_technical_resource_create", {
        controllable_unit_id: String(controllableUnitId),
      })}
      state={locationState}
      variant="primary"
      icon={IconPlus}
    >
      Create technical resource
    </Button>
  );
};

const DeleteTechnicalResourceButton = ({
  record,
}: {
  record: TechnicalResource;
}) => {
  const queryClient = useQueryClient();

  const { buttonProps, dialog } = useConfirmAction({
    title: "Delete",
    content:
      "Are you sure you want to delete this item? This action cannot be undone.",
    onConfirmMutation: {
      mutationFn: () =>
        deleteTechnicalResource({ path: { id: record.id } }).then(throwOnError),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "technical_resource",
            { controllable_unit_id: record.controllable_unit_id },
          ],
        });
      },
    },
  });

  return (
    <>
      <Button
        variant="invisible"
        className="text-semantic-background-action-danger"
        size="medium"
        icon={IconTrash}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          buttonProps.onClick();
        }}
      />
      {dialog}
    </>
  );
};

export const TechnicalResourceList = () => {
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();
  const navigate = useTypedNavigate();
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();

  const canRead = permissions?.allow("technical_resource", "read");
  const canDelete = permissions?.allow("technical_resource", "delete");
  const canCreate = permissions?.allow("technical_resource", "create");

  const { data } = useTechnicalResources(Number(id));

  const columns: ColumnOf<typeof data>[] = [
    { key: "id", header: translate("field.technical_resource.id") },
    { key: "name", header: translate("field.technical_resource.name") },
    {
      key: "maximum_active_power",
      header: translate("field.technical_resource.maximum_active_power"),
    },
    {
      key: "device_type",
      header: translate("field.technical_resource.device_type"),
      render: (value) =>
        translateEnum(`device_type.${value as string}` as EnumLabel),
    },
  ];

  return (
    canRead && (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          {canCreate && <CreateButton controllableUnitId={id} />}
        </div>
        <SimpleTable
          columns={columns}
          data={data ?? []}
          empty={
            "No technical resources yet. To set the controllable unit as active, one technical resource is required."
          }
          rowClick={(record) => {
            navigate({
              to: "cu_technical_resource_show",
              params: {
                controllable_unit_id: String(record.controllable_unit_id),
                id: String(record.id),
              },
            });
          }}
          action={
            canDelete
              ? {
                  header: "Delete",
                  render: (record) => (
                    <DeleteTechnicalResourceButton record={record} />
                  ),
                }
              : undefined
          }
        />
      </div>
    )
  );
};
