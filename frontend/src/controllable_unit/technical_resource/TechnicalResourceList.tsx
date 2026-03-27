import {
  usePermissions,
  useRecordContext,
  Identifier,
  useTranslate,
} from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { TechnicalResourceInputLocationState } from "./TechnicalResourceInput";
import { TechnicalResource } from "../../generated-client";
import { deleteTechnicalResource } from "../../generated-client";
import { SimpleTable, ColumnOf } from "../../components/SimpleTable";
import { BodyText, Button } from "../../components/ui";
import { IconPlus, IconTrash } from "@elhub/ds-icons";
import { useConfirmAction } from "../../components/ConfirmAction";
import { throwOnError } from "../../util";
import { useTechnicalResources } from "./useTechnicalResources";

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
      to={`/controllable_unit/${controllableUnitId}/technical_resource/create`}
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
  const navigate = useNavigate();
  const translate = useTranslate();

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
      render: (value) => translate(`enum.device_type.${value}`),
    },
  ];

  return (
    canRead && (
      <div className="flex flex-col gap-4">
        {canCreate && <CreateButton controllableUnitId={id} />}
        <SimpleTable
          columns={columns}
          data={data ?? []}
          empty={
            <BodyText>
              No technical resources yet. To set the controllable unit as
              active, one technical resource is required.
            </BodyText>
          }
          rowClick={(record) => {
            navigate(
              `/controllable_unit/${record.controllable_unit_id}/technical_resource/${record.id}/show`,
            );
          }}
          action={
            canDelete
              ? {
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
