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

const CreateButton = ({ id }: { id: number }) => (
  <Button
    component={Link}
    to={`/controllable_unit/${id}/service_provider/create`}
    startIcon={<AddIcon />}
    state={{ controllable_unit_id: id }}
    label="Create"
  />
);

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
  permissions: string[];
  id: any;
  business_id: string;
}) => (
  <TopToolbar>
    {permissions.includes("controllable_unit.lookup") && (
      <CULookupButton business_id={business_id} />
    )}
    {permissions.includes("controllable_unit_service_provider.create") && (
      <CreateButton id={id} />
    )}
  </TopToolbar>
);

export const ControllableUnitServiceProviderList = () => {
  const { id, business_id } = useRecordContext()!;
  const { permissions } = usePermissions();

  if (!permissions.includes("controllable_unit_service_provider.read")) {
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
          {permissions.includes(
            "controllable_unit_service_provider.delete",
          ) && <DeleteButton mutationMode="pessimistic" redirect="" />}
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};
