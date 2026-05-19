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
import { ProductTypeArrayField } from "../../product_type/components";
import { zServiceProvidingGroupProductSuspension } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

const CreateButton = ({ id }: { id: any }) => (
  <Button
    as={Link}
    icon={IconPlus}
    to={
      id
        ? `/service_providing_group/${id}/product_suspension/create`
        : "/service_providing_group_product_suspension/create"
    }
    state={{ service_providing_group_id: id }}
    variant="invisible"
  >
    Create
  </Button>
);

export const ServiceProvidingGroupProductSuspensionList = () => {
  const record = useRecordContext();
  const id = record?.id;
  const { permissions } = usePermissions<Permissions>();

  const canRead = permissions?.allow(
    "service_providing_group_product_suspension",
    "read",
  );
  const canCreate = permissions?.allow(
    "service_providing_group_product_suspension",
    "create",
  );
  const canDelete = permissions?.allow(
    "service_providing_group_product_suspension",
    "delete",
  );

  const isURLFlat = useLocation().pathname.includes(
    "service_providing_group_product_suspension",
  );

  const fields = getFields(zServiceProvidingGroupProductSuspension.shape);

  return (
    canRead && (
      <ResourceContextProvider value="service_providing_group_product_suspension">
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
              `/service_providing_group/${r.service_providing_group_id}/product_suspension/${r.id}/show`
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
              source={fields.procuring_system_operator_id.source}
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <ProductTypeArrayField source={fields.product_type_ids.source} />
            <EnumField
              source={fields.reason.source}
              enumKey="service_providing_group_product_suspension.reason"
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
