import {
  usePermissions,
  ResourceContextProvider,
  useDelete,
  useNotify,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { List, Datagrid } from "../../components/EDS-ra/list";
import {
  DateField,
  IdentityField,
  ReferenceField,
  ScopesField,
  TextField,
} from "../../components/EDS-ra/fields";
import { useConfirmAction } from "../../components/ConfirmAction";
import { BodyText, Button, Dropdown, Tooltip } from "../../components/ui";
import {
  IconCopy,
  IconDots,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@elhub/ds-icons";

// Long values (e.g. public keys) are truncated in the table. The full value is
// available in a tooltip and can be copied with the button.
const CopyableTextField = ({
  source,
  emptyText = "--",
}: {
  source: string;
  label?: string;
  emptyText?: string;
}) => {
  const record = useRecordContext();
  const notify = useNotify();
  const value: string | null | undefined = record?.[source];

  if (!value) {
    return <BodyText size="small">{emptyText}</BodyText>;
  }

  const copy = () =>
    navigator.clipboard
      .writeText(value)
      .then(() => notify("Copied to clipboard", { type: "success" }))
      .catch(() => notify("Could not copy to clipboard", { type: "error" }));

  return (
    <div className="flex items-center gap-1">
      <Tooltip content={<span className="break-all">{value}</span>}>
        <span className="inline-block max-w-40 truncate align-middle">
          <BodyText size="small" as="span">
            {value}
          </BodyText>
        </span>
      </Tooltip>
      <Button
        variant="invisible"
        size="small"
        icon={IconCopy}
        aria-label="Copy"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          copy();
        }}
      />
    </div>
  );
};

type EntityClientRow = { id: number; entity_id: number };

const RowActionsMenu = ({ record }: { record: EntityClientRow }) => {
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canUpdate = permissions?.allow("entity_client", "update");
  const canDelete = permissions?.allow("entity_client", "delete");
  const [deleteMutation] = useDelete(
    "entity_client",
    { id: record.id },
    { returnPromise: true },
  );
  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.delete"),
    content: translate("text.delete_confirm"),
    onConfirmMutation: { mutationFn: async () => deleteMutation() },
  });

  if (!canUpdate && !canDelete) return null;

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
          <Dropdown.Menu.GroupedList.Heading>
            {translate("text.resource_show_layout.actions_group_label")}
          </Dropdown.Menu.GroupedList.Heading>
          <Dropdown.Menu.GroupedList>
            {canUpdate && (
              <Dropdown.Menu.GroupedList.Item
                as={RouterLink}
                to={`/entity/${record.entity_id}/client/${record.id}`}
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
        </Dropdown.Menu>
      </Dropdown>
      {dialog}
    </>
  );
};

const CreateEntityClientButton = ({ entityId }: { entityId: any }) => (
  <Button
    as={RouterLink}
    to={`/entity/${entityId}/client/create`}
    state={{ entity_id: entityId }}
    variant="primary"
    icon={IconPlus}
  >
    Create
  </Button>
);

type Props = {
  entityId?: string;
};

export const EntityClientList = ({ entityId }: Props) => {
  let { id } = useParams()!;
  if (!id && entityId) {
    id = entityId;
  }
  const { permissions } = usePermissions<Permissions>();
  const canRead = permissions?.allow("entity_client", "read");
  const canCreate = permissions?.allow("entity_client", "create");

  return (
    canRead && (
      <ResourceContextProvider value="entity_client">
        <List
          perPage={10}
          empty={false}
          filter={{ entity_id: id }}
          sort={{ field: "id", order: "DESC" }}
          disableSyncWithLocation
          actions={
            canCreate
              ? [<CreateEntityClientButton key="create" entityId={id} />]
              : []
          }
        >
          <Datagrid<EntityClientRow>
            rowClick={false}
            rowActions={(r) => <RowActionsMenu record={r} />}
          >
            <TextField hideLabel source="id" label="field.entity_client.id" />
            <TextField
              source="client_id"
              hideLabel={true}
              label="field.entity_client.client_id"
            />
            <TextField
              hideLabel
              source="name"
              label="field.entity_client.name"
            />
            <ReferenceField
              source="party_id"
              reference="party"
              hideLabel={true}
              label="field.entity_client.party_id"
            >
              <TextField source="name" />
            </ReferenceField>
            <ScopesField
              hideLabel
              source="scopes"
              label="field.entity_client.scopes"
            />
            <TextField
              hideLabel
              source="client_secret"
              label="field.entity_client.client_secret"
            />
            <CopyableTextField
              source="public_key"
              label="field.entity_client.public_key"
            />
            <DateField
              hideLabel={true}
              source="recorded_at"
              showTime
              label="field.entity_client.recorded_at"
            />
            <IdentityField
              hideLabel
              source="recorded_by"
              label="field.entity_client.recorded_by"
            />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
