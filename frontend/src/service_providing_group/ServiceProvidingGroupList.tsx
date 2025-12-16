import {
  List,
  ReferenceField,
  TextField,
  ReferenceManyField,
} from "react-admin";
import { Datagrid } from "../auth";
import { DateField } from "../components/datetime";

export const ServiceProvidingGroupList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }} empty={false}>
    <Datagrid>
      <TextField source="id" label="field.service_providing_group.id" />
      <TextField source="name" label="field.service_providing_group.name" />
      <ReferenceField
        source="service_provider_id"
        reference="party"
        sortable={false}
        label="field.service_providing_group.service_provider_id"
      >
        <TextField source="name" />
      </ReferenceField>
      <TextField
        source="bidding_zone"
        label="field.service_providing_group.bidding_zone"
      />
      <TextField source="status" label="field.service_providing_group.status" />
      <ReferenceManyField
        reference="service_providing_group_grid_prequalification"
        target="service_providing_group_id"
        label="Grid prequalification"
        sortable={false}
      >
        <Datagrid empty={<span>No grid prequalification</span>}>
          <ReferenceField
            source="impacted_system_operator_id"
            reference="party"
            sortable={false}
            label="field.service_providing_group_grid_prequalification.impacted_system_operator_id"
          >
            <TextField source="name" />
          </ReferenceField>
          <TextField
            source="status"
            label="field.service_providing_group_grid_prequalification.status"
          />
        </Datagrid>
      </ReferenceManyField>
      <ReferenceManyField
        reference="service_providing_group_product_application"
        target="service_providing_group_id"
        label="Product application"
        sortable={false}
      >
        <Datagrid empty={<span>No product application</span>}>
          <ReferenceField
            source="procuring_system_operator_id"
            reference="party"
            sortable={false}
            label="field.service_providing_group_product_application.procuring_system_operator_id"
          >
            <TextField source="name" />
          </ReferenceField>
          <TextField
            source="status"
            label="field.service_providing_group_product_application.status"
          />
        </Datagrid>
      </ReferenceManyField>
      <DateField
        source="recorded_at"
        showTime
        label="field.service_providing_group.recorded_at"
      />
    </Datagrid>
  </List>
);
