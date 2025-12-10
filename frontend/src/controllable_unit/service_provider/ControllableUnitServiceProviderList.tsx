import {
  List,
  Button,
  DeleteButton,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { Permissions } from "../../auth/permissions";
import { ControllableUnitServiceProviderLocationState } from "./ControllableUnitServiceProviderInput";

const CreateButton = ({ id }: { id: number }) => {
  const locationState: ControllableUnitServiceProviderLocationState = {
    cusp: { controllable_unit_id: id },
  };
  return (
    <Button
      component={Link}
      to={`/controllable_unit/${id}/service_provider/create`}
      startIcon={<AddIcon />}
      state={locationState}
      label="Create"
    />
  );
};

const CULookupButton = ({ business_id }: { business_id: string }) => (
  <Button
    component={Link}
    to="/controllable_unit/lookup"
    startIcon={<TravelExploreIcon />}
    state={{ controllable_unit: business_id }}
    label="Lookup this controllable unit"
  />
);

const ListActions = ({
  permissions,
  id,
  business_id,
}: {
  permissions: Permissions | undefined;
  id: any;
  business_id: string;
}) => {
  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const canCreate = permissions?.allow(
    "controllable_unit_service_provider",
    "create",
  );

  return (
    <TopToolbar>
      {canLookup && <CULookupButton business_id={business_id} />}
      {canCreate && <CreateButton id={id} />}
    </TopToolbar>
  );
};

export const ControllableUnitServiceProviderList = () => {
  const { id, business_id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();

  // Permission checks
  const canRead = permissions?.allow(
    "controllable_unit_service_provider",
    "read",
  );
  const canDelete = permissions?.allow(
    "controllable_unit_service_provider",
    "delete",
  );

  if (!canRead) {
    return null; // or a fallback UI
  }

  return (
    <ResourceContextProvider value="controllable_unit_service_provider">
      <List
        title={false}
        perPage={10}
        actions={
          <ListActions
            permissions={permissions}
            id={id}
            business_id={business_id}
          />
        }
        exporter={false}
        empty={false}
        filter={{ controllable_unit_id: id, "valid_from@not.is": null }}
        sort={{ field: "valid_from", order: "DESC" }}
        disableSyncWithLocation
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(_id, _res, record) =>
            `/controllable_unit/${record.controllable_unit_id}/service_provider/${record.id}/show`
          }
        >
          <TextField source="id" label="ID" />
          <ReferenceField
            source="service_provider_id"
            reference="party"
            sortable={false}
          >
            <TextField source="name" />
          </ReferenceField>
          <TextField source="contract_reference" />
          <DateField source="valid_from" showTime />
          <DateField source="valid_to" showTime />
          {canDelete && <DeleteButton mutationMode="pessimistic" redirect="" />}
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};
