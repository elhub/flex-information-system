import { usePermissions } from "react-admin";
import { List, Datagrid } from "../components/EDS-ra/list";
import {
  TextField,
  ReferenceField,
  EnumField,
  StatusBadgeField,
} from "../components/EDS-ra/fields";
import { zServiceProvidingGroup } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { Permissions } from "../auth/permissions";
import { CreateButton } from "../components/EDS-ra";
import { spgStatusVariantMap } from "./serviceProvidingGroupStatus";
import { ServiceProvidingGroupExpandedRow } from "./ServiceProvidingGroupExpandedRow";
import { RaRecord } from "ra-core";

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
      <Datagrid
        expandPanel={(record: RaRecord) => (
          <ServiceProvidingGroupExpandedRow
            record={record as RaRecord & { id: number }}
          />
        )}
      >
        <TextField source={fields.id.source} />
        <TextField source={fields.name.source} weight="semibold" />
        <ReferenceField
          source={fields.service_provider_id.source}
          reference="party"
          label="field.service_providing_group.service_provider_id"
          hideLabel
        >
          <TextField source="name" />
        </ReferenceField>
        <EnumField
          source={fields.bidding_zone.source}
          enumKey="service_providing_group.bidding_zone"
        />
        <StatusBadgeField
          source={fields.status.source}
          enumKey="service_providing_group.status"
          variantMap={spgStatusVariantMap}
        />
      </Datagrid>
    </List>
  );
};
