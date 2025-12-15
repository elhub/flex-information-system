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

const CreateButton = ({ id }: { id: number | undefined }) => {
  const locationState: ControllableUnitServiceProviderLocationState = {
    cusp: { controllable_unit_id: id },
  };
  return (
    <Button
      component={Link}
      to={`/controllable_unit/${id}/service_provider/create`}
      startIcon={<AddIcon />}
      state={id ? locationState : undefined}
      label="Create"
    />
  );
};

const CULookupButton = ({
  business_id,
}: {
  business_id: string | undefined;
}) => (
  <Button
    component={Link}
    to="/controllable_unit/lookup"
    startIcon={<TravelExploreIcon />}
    state={business_id ? { controllable_unit: business_id } : undefined}
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
  business_id: string | undefined;
}) => {
  const canLookup = permissions?.allow("controllable_unit", "lookup");
  const canCreate = permissions?.allow(
    "controllable_unit_service_provider",
    "create",
  );

  return (
    <TopToolbar>
      {/* id undefined = standalone CUSP list (so no lookup button) */}
      {id && canLookup && <CULookupButton business_id={business_id} />}
      {canCreate && <CreateButton id={id} />}
    </TopToolbar>
  );
};

export const ControllableUnitServiceProviderList = () => {
  const cuspData = useRecordContext();
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
            id={cuspData?.id}
            business_id={cuspData?.business_id}
          />
        }
        exporter={false}
        empty={false}
        filter={
          cuspData
            ? { controllable_unit_id: cuspData.id, "valid_from@not.is": null }
            : { "valid_from@not.is": null }
        }
        sort={{ field: "valid_from", order: "DESC" }}
        disableSyncWithLocation
      >
        <Datagrid
          bulkActionButtons={false}
          rowClick={(_id, _res, record) =>
            `/controllable_unit/${record.controllable_unit_id}/service_provider/${record.id}/show`
          }
        >
          <TextField
            source="id"
            label="field.controllable_unit_service_provider.id"
          />
          <ReferenceField
            source="service_provider_id"
            reference="party"
            sortable={false}
            label="field.controllable_unit_service_provider.service_provider_id"
          >
            <TextField source="name" />
          </ReferenceField>
          <TextField
            source="contract_reference"
            label="field.controllable_unit_service_provider.contract_reference"
          />
          <DateField
            source="valid_from"
            showTime
            label="field.controllable_unit_service_provider.valid_from"
          />
          <DateField
            source="valid_to"
            showTime
            label="field.controllable_unit_service_provider.valid_to"
          />
          {canDelete && <DeleteButton mutationMode="pessimistic" redirect="" />}
        </Datagrid>
      </List>
    </ResourceContextProvider>
  );
};
