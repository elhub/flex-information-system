import {
  usePermissions,
  RecordContextProvider,
  ResourceContextProvider,
  useNotify,
  useTranslate,
} from "ra-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { IdentityField } from "../../components/EDS-ra/fields";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { useConfirmAction } from "../../components/ConfirmAction";
import {
  BodyText,
  Button,
  Chips,
  Dropdown,
  Loader,
  Tooltip,
} from "../../components/ui";
import { deleteEntityClient, listEntityClient } from "../../generated-client";
import { useTranslateField } from "../../intl/intl";
import { throwOnError } from "../../util";
import {
  IconCopy,
  IconDots,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@elhub/ds-icons";

// Long values (e.g. public keys) are truncated in the table. The full value is
// available in a tooltip and can be copied with the button.
const CopyableText = ({
  value,
  emptyText = "--",
}: {
  value: string | null | undefined;
  emptyText?: string;
}) => {
  const notify = useNotify();

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

const entityClientsQueryKey = (entityId: number | string | undefined) => [
  "entity_client",
  { entity_id: Number(entityId) },
];

const RowActionsMenu = ({ record }: { record: EntityClientRow }) => {
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canUpdate = permissions?.allow("entity_client", "update");
  const canDelete = permissions?.allow("entity_client", "delete");
  const canReadEvent = permissions?.allow("event", "read");
  const queryClient = useQueryClient();
  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.delete"),
    content: translate("text.delete_confirm"),
    onConfirmMutation: {
      mutationFn: () =>
        deleteEntityClient({ path: { id: record.id } }).then(throwOnError),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: entityClientsQueryKey(record.entity_id),
        });
      },
    },
  });

  const eventsFilter = encodeURIComponent(
    JSON.stringify({ "source@eq": `/entity_client/${record.id}` }),
  );

  const hasActions = canUpdate || canDelete;
  if (!hasActions && !canReadEvent) return null;

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
            </>
          )}
          {canReadEvent && (
            <>
              {hasActions && <Dropdown.Menu.Divider />}
              <Dropdown.Menu.GroupedList.Heading>
                {translate("text.resource_show_layout.navigate_group_label")}
              </Dropdown.Menu.GroupedList.Heading>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Item
                  as={RouterLink}
                  to={`/event?filter=${eventsFilter}`}
                >
                  <div className="flex items-center gap-2">
                    {translate("text.events")}
                  </div>
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
      {dialog}
    </>
  );
};

const CreateEntityClientButton = ({ entityId }: { entityId: any }) => (
  <Button
    as={RouterLink}
    size="small"
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
  const t = useTranslateField();
  const canRead = permissions?.allow("entity_client", "read");
  const canCreate = permissions?.allow("entity_client", "create");

  const { data, isLoading } = useQuery({
    queryKey: entityClientsQueryKey(id),
    queryFn: () =>
      listEntityClient({
        query: { entity_id: `eq.${id}`, embed: "party", order: "id.desc" },
      }).then(throwOnError),
    enabled: !!id && !!canRead,
  });

  if (!canRead) return null;
  if (isLoading) return <Loader />;

  const columns: ColumnOf<typeof data>[] = [
    { key: "id", header: t("entity_client.id") },
    { key: "client_id", header: t("entity_client.client_id") },
    { key: "name", header: t("entity_client.name") },
    {
      key: "party_id",
      header: t("entity_client.party_id"),
      render: (_, row) => row.party?.name ?? row.party_id ?? "",
    },
    {
      key: "scopes",
      header: t("entity_client.scopes"),
      render: (value) => (
        <Chips>
          {(value as string[]).map((scope) => (
            <Chips.Chip key={scope}>{scope}</Chips.Chip>
          ))}
        </Chips>
      ),
    },
    {
      key: "public_key",
      header: t("entity_client.public_key"),
      render: (value) => <CopyableText value={value as string | undefined} />,
    },
    {
      key: "recorded_at",
      header: t("entity_client.recorded_at"),
      render: (value) => formatDate(String(value), "dd.MM.yyyy HH:mm"),
    },
    {
      key: "recorded_by",
      header: t("entity_client.recorded_by"),
      render: (_, row) => (
        <ResourceContextProvider value="entity_client">
          <RecordContextProvider value={row}>
            <IdentityField source="recorded_by" />
          </RecordContextProvider>
        </ResourceContextProvider>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {canCreate && (
        <div className="flex justify-end">
          <CreateEntityClientButton entityId={id} />
        </div>
      )}
      <SimpleTable
        data={data ?? []}
        columns={columns}
        className="w-full"
        rowActions={(row) => <RowActionsMenu record={row} />}
      />
    </div>
  );
};
