import { ReferenceManyField, usePermissions } from "react-admin";
import { Datagrid, List } from "../components/EDS-ra/list";
import {
  DateField,
  EnumField,
  ReferenceField,
  TextField,
} from "../components/EDS-ra/fields";
import { zServiceProvidingGroup } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { Permissions } from "../auth/permissions";
import { CreateButton } from "../components/EDS-ra";

export const ServiceProvidingGroupList = () => {
  const fields = getFields(zServiceProvidingGroup.shape);
  const { permissions } = usePermissions<Permissions>();
  const canCreate = permissions?.allow("service_providing_group", "create");

  return (
    <List
      sort={{ field: "id", order: "DESC" }}
      empty={false}
      actions={canCreate ? [<CreateButton key="create" />] : []}
    >
      <Datagrid>
        <TextField source={fields.id.source} />
        <TextField source={fields.name.source} />
        <ReferenceField
          source={fields.service_provider_id.source}
          reference="party"
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source={fields.bidding_zone.source}
          enumKey="service_providing_group.bidding_zone"
        />
        <EnumField
          source={fields.status.source}
          enumKey="service_providing_group.status"
        />
        <ReferenceManyField
          reference="service_providing_group_grid_prequalification"
          target="service_providing_group_id"
          label="text.spg_grid_prequalification_header"
          sortable={false}
        >
          <Datagrid>
            <ReferenceField
              source="impacted_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <EnumField
              source="status"
              enumKey="service_providing_group_grid_prequalification.status"
            />
          </Datagrid>
        </ReferenceManyField>
        <ReferenceManyField
          reference="service_providing_group_product_application"
          target="service_providing_group_id"
          label="text.spg_product_application_header"
          sortable={false}
        >
          <Datagrid>
            <ReferenceField
              source="procuring_system_operator_id"
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <EnumField
              source="status"
              enumKey="service_providing_group_product_application.status"
            />
          </Datagrid>
        </ReferenceManyField>
        <DateField source={fields.recorded_at.source} showTime />
      </Datagrid>
    </List>
  );
};
