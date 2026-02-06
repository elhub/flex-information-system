import { usePermissions, useRecordContext, Identifier } from "ra-core";
import { ResourceContextProvider } from "react-admin";
import { Link as RouterLink } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { TechnicalResourceInputLocationState } from "./TechnicalResourceInput";
import { List, Datagrid } from "../../components/EDS-ra/list";
import { TextField } from "../../components/EDS-ra/fields";
import { DeleteButton } from "../../components/EDS-ra";
import { Button, Heading } from "../../components/ui";
import { zTechnicalResource } from "../../generated-client/zod.gen";
import { getFields } from "../../util";
import { IconPlus } from "@elhub/ds-icons";

// automatically fill the controllable_unit_id field with the ID of the
// show page the create button is displayed on
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
      variant="invisible"
      icon={IconPlus}
    >
      Create
    </Button>
  );
};

export const TechnicalResourceList = () => {
  // id of the controllable unit whose technical resources we want to get
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow("technical_resource", "read");
  const canCreate = permissions?.allow("technical_resource", "create");
  const canDelete = permissions?.allow("technical_resource", "delete");

  const actions = canCreate
    ? [<CreateButton key="create" controllableUnitId={id} />]
    : [];
  const fields = getFields(zTechnicalResource.shape);

  return (
    canRead && (
      <ResourceContextProvider value="technical_resource">
        <Heading level={3} size="medium" className="mb-2">
          Technical resources
        </Heading>
        <List
          pagination={false}
          perPage={10}
          actions={actions}
          exporter={false}
          empty={false}
          filter={{ controllable_unit_id: id }}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            rowClick={(record) =>
              `/controllable_unit/${record.controllable_unit_id}/technical_resource/${record.id}/show`
            }
          >
            <TextField source={fields.id.source} />
            <TextField source={fields.name.source} />
            <TextField source={fields.details.source} />
            {canDelete && <DeleteButton label="Delete" />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
