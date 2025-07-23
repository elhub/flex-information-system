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

export const ControllableUnitServiceProviderList = () => {
  // id of the controllable unit whose relations we want to get
  const { id, business_id } = useRecordContext()!;
  const { permissions } = usePermissions();

  // automatically fill the controllable_unit_id field with the ID of the
  // show page the create button is displayed on
  const CreateButton = () => (
    <Button
      component={Link}
      to={`/controllable_unit/${id}/service_provider/create`}
      startIcon={<AddIcon />}
      state={{ controllable_unit_id: id }}
      label="Create"
    />
  );

  const CULookupButton = () => (
    <Button
      component={Link}
      to="/controllable_unit/lookup"
      startIcon={<TravelExploreIcon />}
      state={{ controllable_unit: business_id }}
      label="Lookup this controllable unit"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("controllable_unit.lookup") && <CULookupButton />}
      {permissions.includes("controllable_unit_service_provider.create") && (
        <CreateButton />
      )}
    </TopToolbar>
  );

  return (
    permissions.includes("controllable_unit_service_provider.read") && (
      // resource context update here,
      // so the fields in the datagrid refer to controllable_unit_service_provider
      // records even though this component is on the controllable_unit show page
      <ResourceContextProvider value="controllable_unit_service_provider">
        <List
          title={false}
          perPage={10}
          actions={<ListActions />}
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
    )
  );
};
