import {
  usePermissions,
  useRecordContext,
  ResourceContextProvider,
} from "ra-core";
import { Link } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { DeleteButton } from "../../components/EDS-ra/buttons";
import { Button } from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { zServiceProvidingGroupMembership } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

const CreateButton = ({ id }: { id: any }) => {
  const createUrl = id
    ? `/service_providing_group/${id}/membership/create`
    : "/service_providing_group_membership/create";

  return (
    <Button
      as={Link}
      icon={IconPlus}
      to={createUrl}
      state={{ service_providing_group_id: id }}
      variant="invisible"
    >
      Create
    </Button>
  );
};

export const ServiceProvidingGroupMembershipList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  const canRead = permissions?.allow(
    "service_providing_group_membership",
    "read",
  );
  const canCreate = permissions?.allow(
    "service_providing_group_membership",
    "create",
  );
  const canDelete = permissions?.allow(
    "service_providing_group_membership",
    "delete",
  );

  const fields = getFields(zServiceProvidingGroupMembership.shape);

  return (
    canRead && (
      <ResourceContextProvider value="service_providing_group_membership">
        <List
          perPage={10}
          actions={canCreate ? [<CreateButton key="create" id={id} />] : []}
          empty={false}
          filter={
            id
              ? { service_providing_group_id: id, "valid_from@not.is": null }
              : { "valid_from@not.is": null }
          }
          sort={{ field: "valid_from", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            rowClick={(r) =>
              `/service_providing_group/${r.service_providing_group_id}/membership/${r.id}/show`
            }
          >
            <TextField source={fields.id.source} />
            {!record?.id && (
              <ReferenceField
                source={fields.service_providing_group_id.source}
                reference="service_providing_group"
              >
                <TextField source="name" />
              </ReferenceField>
            )}
            <ReferenceField
              source={fields.controllable_unit_id.source}
              reference="controllable_unit"
            >
              <TextField source="name" />
            </ReferenceField>
            <DateField source={fields.valid_from.source} showTime />
            <DateField source={fields.valid_to.source} showTime />
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
