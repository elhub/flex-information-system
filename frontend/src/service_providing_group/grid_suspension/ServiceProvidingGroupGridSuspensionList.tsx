import { usePermissions, useRecordContext, ResourceContextProvider } from "ra-core";
import { Link, useLocation } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  IdentityField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { DeleteButton } from "../../components/EDS-ra/buttons";
import { Button } from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { zServiceProvidingGroupGridSuspension } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    as={Link}
    icon={IconPlus}
    to={
      id
        ? `/service_providing_group/${id}/grid_suspension/create`
        : "/service_providing_group_grid_suspension/create"
    }
    state={{ service_providing_group_id: id }}
    variant="invisible"
  >
    Create
  </Button>
);

export const ServiceProvidingGroupGridSuspensionList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  const canRead = permissions?.allow(
    "service_providing_group_grid_suspension",
    "read",
  );
  const canCreate = permissions?.allow(
    "service_providing_group_grid_suspension",
    "create",
  );
  const canDelete = permissions?.allow(
    "service_providing_group_grid_suspension",
    "delete",
  );

  const isURLFlat = useLocation().pathname.includes(
    "service_providing_group_grid_suspension",
  );

  const fields = getFields(zServiceProvidingGroupGridSuspension.shape);

  return (
    canRead && (
      <ResourceContextProvider value="service_providing_group_grid_suspension">
        <List
          perPage={10}
          actions={canCreate ? [<CreateButton key="create" id={id} />] : []}
          empty={false}
          filter={id ? { service_providing_group_id: id } : undefined}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            rowClick={(r) =>
              `/service_providing_group/${r.service_providing_group_id}/grid_suspension/${r.id}/show`
            }
          >
            <TextField source={fields.id.source} />
            {(!record?.id || isURLFlat) && (
              <ReferenceField
                source={fields.service_providing_group_id.source}
                reference="service_providing_group"
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source={fields.impacted_system_operator_id.source}
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <EnumField
              source={fields.reason.source}
              enumKey="service_providing_group_grid_suspension.reason"
            />
            {isURLFlat && (
              <DateField source={fields.recorded_at.source} showTime />
            )}
            {isURLFlat && (
              <IdentityField source={fields.recorded_by.source} />
            )}
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
