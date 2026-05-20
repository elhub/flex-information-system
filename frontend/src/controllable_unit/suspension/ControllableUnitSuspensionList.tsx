import {
  usePermissions,
  useRecordContext,
  ResourceContextProvider,
} from "ra-core";
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
import { zControllableUnitSuspension } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    as={Link}
    icon={IconPlus}
    to={
      id
        ? `/controllable_unit/${id}/suspension/create`
        : "/controllable_unit_suspension/create"
    }
    state={{ controllable_unit_id: id }}
    variant="invisible"
  >
    Create
  </Button>
);

export const ControllableUnitSuspensionList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  const canRead = permissions?.allow("controllable_unit_suspension", "read");
  const canCreate = permissions?.allow(
    "controllable_unit_suspension",
    "create",
  );
  const canDelete = permissions?.allow(
    "controllable_unit_suspension",
    "delete",
  );

  const isURLFlat = useLocation().pathname.includes(
    "controllable_unit_suspension",
  );

  const fields = getFields(zControllableUnitSuspension.shape);

  return (
    canRead && (
      <ResourceContextProvider value="controllable_unit_suspension">
        <List
          perPage={10}
          actions={canCreate ? [<CreateButton key="create" id={id} />] : []}
          empty={false}
          filter={id ? { controllable_unit_id: id } : undefined}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            rowClick={(r) =>
              `/controllable_unit/${r.controllable_unit_id}/suspension/${r.id}/show`
            }
          >
            {isURLFlat && <TextField source={fields.id.source} />}
            {isURLFlat && (
              <ReferenceField
                source={fields.controllable_unit_id.source}
                reference="controllable_unit"
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
              enumKey="controllable_unit_suspension.reason"
            />
            {isURLFlat && (
              <DateField source={fields.recorded_at.source} showTime />
            )}
            {isURLFlat && <IdentityField source={fields.recorded_by.source} />}
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
