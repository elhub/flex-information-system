import {
  usePermissions,
  useRecordContext,
  Identifier,
  useTranslate,
} from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { TechnicalResourceInputLocationState } from "./TechnicalResourceInput";
import {
  TechnicalResource,
  deleteTechnicalResource,
} from "../../generated-client";
import { SimpleTable, ColumnOf } from "../../components/SimpleTable";
import {
  Button,
  Heading,
  BodyText,
  Card,
  CardContent,
} from "../../components/ui";
import { IconPlus, IconTrash } from "@elhub/ds-icons";
import { useConfirmAction } from "../../components/ConfirmAction";
import { throwOnError } from "../../util";
import { useTechnicalResources } from "./useTechnicalResources";
import { useTranslateEnum } from "../../intl/intl";
import { EnumLabel } from "../../intl/enum-labels";
import { TechnicalResourceDetailModal } from "./TechnicalResourceDetailModal";

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
  const translate = useTranslate();
  const translateEnum = useTranslateEnum();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTrId = searchParams.get("tr")
    ? Number(searchParams.get("tr"))
    : null;

  const setSelectedTrId = (trId: number | null) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trId != null) {
          next.set("tr", String(trId));
        } else {
          next.delete("tr");
        }
        return next;
      },
      { replace: true },
    );

  const canRead = permissions?.allow("technical_resource", "read");
  const canDelete = permissions?.allow("technical_resource", "delete");
  const canCreate = permissions?.allow("technical_resource", "create");

  const { data } = useTechnicalResources(Number(id));

  const selectedRecord = data?.find((r) => r.id === selectedTrId) ?? null;

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
            <Card>
              <CardContent>
                <div className="flex flex-col gap-2 py-4">
                  <Heading level={3}>No technical resources</Heading>
                  <BodyText>
                    A technical resource represents a physical device or asset
                    (such as a battery, generator, or flexible load) that
                    provides the actual controllable capacity.
                  </BodyText>
                  <BodyText>
                    To set the controllable unit as active, at least one
                    technical resource is required.
                  </BodyText>
                </div>
              </CardContent>
            </Card>
          }
          rowClick={(record) => {
            setSelectedTrId(record.id);
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
        <TechnicalResourceDetailModal
          record={selectedRecord}
          open={selectedTrId !== null}
          onClose={() => setSelectedTrId(null)}
        />
      </div>
    )
  );
};
