import {
  usePermissions,
  useRecordContext,
  ResourceContextProvider,
} from "ra-core";
import { Link } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import { Button } from "../../components/ui";
import { IconPlus } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { zServiceProvidingGroupGridPrequalification } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    as={Link}
    icon={IconPlus}
    to={
      id
        ? `/service_providing_group/${id}/grid_prequalification/create`
        : "/service_providing_group_grid_prequalification/create"
    }
    state={{ service_providing_group_id: id }}
    variant="invisible"
  >
    Create
  </Button>
);

export const ServiceProvidingGroupGridPrequalificationList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  const canRead = permissions?.allow(
    "service_providing_group_grid_prequalification",
    "read",
  );
  const canCreate = permissions?.allow(
    "service_providing_group_grid_prequalification",
    "create",
  );

  const fields = getFields(zServiceProvidingGroupGridPrequalification.shape);

  return (
    canRead && (
      <ResourceContextProvider value="service_providing_group_grid_prequalification">
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
              `/service_providing_group/${r.service_providing_group_id}/grid_prequalification/${r.id}/show`
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
              source={fields.impacted_system_operator_id.source}
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <EnumField
              source={fields.status.source}
              enumKey="service_providing_group_grid_prequalification.status"
            />
            <DateField source={fields.prequalified_at.source} showTime />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
