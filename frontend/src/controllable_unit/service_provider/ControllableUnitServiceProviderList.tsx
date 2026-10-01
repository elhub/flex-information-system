import {
  ResourceContextProvider,
  useDelete,
  useGetOne,
  usePermissions,
  useTranslate,
} from "ra-core";
import { Link, useParams } from "react-router-dom";
import { Datagrid, List } from "../../components/EDS-ra/list";
import { DateField, TextField } from "../../components/EDS-ra/fields";
import { NestedResourceHistoryButton } from "../../components/EDS-ra/buttons";
import { useConfirmAction } from "../../components/ConfirmAction";
import { Button, Dropdown, Loader } from "../../components/ui";
import {
  IconDots,
  IconPencil,
  IconPlus,
  IconTrash,
  IconSearch,
} from "@elhub/ds-icons";
import { Permissions } from "../../auth/permissions";
import { ControllableUnitServiceProviderLocationState } from "./ControllableUnitServiceProviderInput";
import { ControllableUnit } from "../../generated-client";
import { zControllableUnitServiceProvider } from "../../generated-client/zod.gen";
import { getFields } from "../../zod";

type CuspRow = { id: number; controllable_unit_id: number };

const RowActionsMenu = ({ record }: { record: CuspRow }) => {
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canUpdate = permissions?.allow(
    "controllable_unit_service_provider",
    "update",
  );
  const canReadHistory = permissions?.allow(
    "controllable_unit_service_provider_history",
    "read",
  );
  const canDelete = permissions?.allow(
    "controllable_unit_service_provider",
    "delete",
  );
  const canReadEvent = permissions?.allow("event", "read");
  const [deleteMutation] = useDelete(
    "controllable_unit_service_provider",
    { id: record.id },
    { returnPromise: true },
  );
  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.delete"),
    content: translate("text.delete_confirm"),
    onConfirmMutation: { mutationFn: async () => deleteMutation() },
  });
  const base = `/controllable_unit/${record.controllable_unit_id}`;
  const historyFilter = encodeURIComponent(
    `{ "controllable_unit_service_provider_id": ${record.id} }`,
  );
  const eventFilter = encodeURIComponent(
    `{ "subject@eq": "/controllable_unit_service_provider/${record.id}" }`,
  );

  const hasActions = canUpdate || canDelete;
  if (!hasActions && !canReadHistory && !canReadEvent) return null;

  return (
    <>
      <Dropdown>
        <Button
          as={Dropdown.Toggle}
          variant="invisible"
          size="small"
          icon={IconDots}
          aria-label={translate(
            "text.resource_show_layout.more_actions_aria_label",
          )}
        />
        <Dropdown.Menu arrow placement="bottom-end">
          {hasActions && (
            <>
              <Dropdown.Menu.GroupedList.Heading>
                {translate("text.resource_show_layout.actions_group_label")}
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList>
                {canUpdate && (
                  <Dropdown.Menu.GroupedList.Item
                    as={Link}
                    to={`${base}/service_provider/${record.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <IconPencil />
                      {translate("text.edit")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
                {canDelete && (
                  <Dropdown.Menu.GroupedList.Item
                    onClick={() => buttonProps.onClick()}
                  >
                    <div className="flex items-center gap-2 text-semantic-background-action-danger">
                      <IconTrash />
                      {translate("text.delete")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
              </Dropdown.Menu.GroupedList>
            </>
          )}
          {(canReadHistory || canReadEvent) && (
            <>
              {hasActions && <Dropdown.Menu.Divider />}
              <Dropdown.Menu.GroupedList.Heading>
                {translate("text.resource_show_layout.navigate_group_label")}
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList>
                {canReadHistory && (
                  <Dropdown.Menu.GroupedList.Item
                    as={Link}
                    to={`${base}/service_provider_history?filter=${historyFilter}`}
                  >
                    <div className="flex items-center gap-2">
                      {translate("text.tab.history")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
                {canReadEvent && (
                  <Dropdown.Menu.GroupedList.Item
                    as={Link}
                    to={`/event?filter=${eventFilter}`}
                  >
                    <div className="flex items-center gap-2">
                      {translate("text.events")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
              </Dropdown.Menu.GroupedList>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
      {dialog}
    </>
  );
};

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

export const ControllableUnitServiceProviderList = ({
  controllableUnitId,
}: {
  controllableUnitId?: number;
}) => {
  const { controllable_unit_id } = useParams<{
    controllable_unit_id: string;
  }>();
  const effectiveControllableUnitId =
    controllableUnitId ?? Number(controllable_unit_id);
  const { data: cu, isLoading } = useGetOne<ControllableUnit & { id: number }>(
    "controllable_unit",
    { id: effectiveControllableUnitId },
    { enabled: Number.isFinite(effectiveControllableUnitId) },
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
        <List
          perPage={10}
          actions={actions}
          empty={false}
          filter={
            cu
              ? {
                  controllable_unit_id: cu.id,
                  "valid_from@not.is": null,
                  embed: "service_provider,end_user",
                }
              : {
                  "valid_from@not.is": null,
                  embed: "service_provider,end_user",
                }
          }
          sort={{ field: "valid_from", order: "DESC" }}
          disableSyncWithLocation
        >
          <Datagrid<CuspRow>
            rowActions={(r) => <RowActionsMenu record={r} />}
            rowClick={(r) =>
              `/controllable_unit/${r.controllable_unit_id}/service_provider/${r.id}/show`
            }
          >
            <TextField source={fields.id.source} />
            <TextField
              source="service_provider.name"
              label="Service provider"
              hideLabel={true}
            />
            <TextField
              source="end_user.id"
              label="End user party id"
              hideLabel={true}
            />
            <TextField source={fields.contract_reference.source} />
            <DateField source={fields.valid_from.source} showTime />
            <DateField source={fields.valid_to.source} showTime />
          </Datagrid>
        </List>
      </div>
    </ResourceContextProvider>
  );
};
