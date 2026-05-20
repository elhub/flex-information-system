import { useGetOne, usePermissions, ResourceContextProvider } from "ra-core";
import { Link, useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import {
  DateField,
  ReferenceField,
  TextField,
} from "../../components/EDS-ra/fields";
import {
  DeleteButton,
  NestedResourceHistoryButton,
} from "../../components/EDS-ra/buttons";
import { Button, Heading, Loader } from "../../components/ui";
import { IconPlus, IconSearch } from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { ControllableUnitServiceProviderLocationState } from "./ControllableUnitServiceProviderInput";
import { ControllableUnit } from "../../generated-client";
import { zControllableUnitServiceProvider } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

const CreateButton = ({ id }: { id: number | undefined }) => {
  const locationState: ControllableUnitServiceProviderLocationState = {
    cusp: { controllable_unit_id: id },
  };
  return (
    <Button
      as={Link}
      icon={IconPlus}
      to={`/controllable_unit/${id}/service_provider/create`}
      state={id ? locationState : undefined}
      variant="invisible"
    >
      Create
    </Button>
  );
};

const CULookupButton = ({
  business_id,
}: {
  business_id: string | undefined;
}) => (
  <Button
    as={Link}
    icon={IconSearch}
    to="/controllable_unit/lookup"
    state={business_id ? { controllable_unit: business_id } : undefined}
    variant="invisible"
  >
    Lookup this controllable unit
  </Button>
);

export const ControllableUnitServiceProviderList = () => {
  const { controllable_unit_id } = useParams<{
    controllable_unit_id: string;
  }>();
  const { data: cu, isLoading } = useGetOne<ControllableUnit & { id: number }>(
    "controllable_unit",
    { id: Number(controllable_unit_id) },
    { enabled: !!controllable_unit_id },
  );
  const { permissions } = usePermissions<Permissions>();

  const canRead = permissions?.allow(
    "controllable_unit_service_provider",
    "read",
  );
  const canCreate = permissions?.allow(
    "controllable_unit_service_provider",
    "create",
  );
  const canDelete = permissions?.allow(
    "controllable_unit_service_provider",
    "delete",
  );
  const canLookup = permissions?.allow("controllable_unit", "lookup");

  if (isLoading) return <Loader />;
  if (!canRead) return null;

  const fields = getFields(zControllableUnitServiceProvider.shape);

  const actions = [
    ...(cu?.id && canLookup
      ? [<CULookupButton key="lookup" business_id={cu.business_id} />]
      : []),
    ...(canCreate ? [<CreateButton key="create" id={cu?.id} />] : []),
    <NestedResourceHistoryButton key="history" child="service_provider" />,
  ];

  return (
    <ResourceContextProvider value="controllable_unit_service_provider">
      <div className="flex flex-col gap-4">
        <Heading level={2} size="small">
          Service provider relations
        </Heading>
        <List
          perPage={10}
          actions={actions}
          empty={false}
          filter={
            cu
              ? { controllable_unit_id: cu.id, "valid_from@not.is": null }
              : { "valid_from@not.is": null }
          }
          sort={{ field: "valid_from", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid
            rowClick={(r) =>
              `/controllable_unit/${r.controllable_unit_id}/service_provider/${r.id}/show`
            }
          >
            <TextField source={fields.id.source} />
            <ReferenceField
              source={fields.service_provider_id.source}
              reference="party"
            >
              <TextField source="name" />
            </ReferenceField>
            <TextField source={fields.contract_reference.source} />
            <DateField source={fields.valid_from.source} showTime />
            <DateField source={fields.valid_to.source} showTime />
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </div>
    </ResourceContextProvider>
  );
};
