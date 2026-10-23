import { formatDate } from "date-fns";
import {
  Identifier,
  useGetIdentity,
  usePermissions,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  IconDots,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@elhub/ds-icons";
import { NestedResourceHistoryButton } from "../../components/EDS-ra";
import { ColumnOf, SimpleTable } from "../../components/SimpleTable";
import { useConfirmAction } from "../../components/ConfirmAction";
import { Button, Chips, Dropdown } from "../../components/ui";
import { Permissions } from "../../auth/permissions";
import { useTranslateField } from "../../intl/intl";
import { AddPartyMemberViaEntityLookupModal } from "./AddPartyMemberViaEntityLookupModal";
import {
  PartyMembershipRow,
  usePartyMemberships,
  useRemovePartyMembership,
} from "./usePartyMemberships";

const CreateButton = ({ id }: { id: Identifier }) => {
  const navigate = useNavigate();
  const state = { party_id: id };
  return (
    <Button
      onClick={() => navigate(`/party/${id}/membership/create`, { state })}
      variant="invisible"
      icon={IconPlus}
    >
      Create
    </Button>
  );
};

const RowActionsMenu = ({ record }: { record: PartyMembershipRow }) => {
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canUpdate = permissions?.allow("party_membership", "update");
  const canDelete = permissions?.allow("party_membership", "delete");
  const canReadHistory = permissions?.allow("party_membership_history", "read");
  const canReadEvent = permissions?.allow("event", "read");
  const remove = useRemovePartyMembership(record.party_id);
  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.delete"),
    content: translate("text.delete_confirm"),
    onConfirmMutation: { mutationFn: () => remove.mutateAsync(record.id) },
  });

  const historyFilter = encodeURIComponent(
    JSON.stringify({ party_membership_id: record.id }),
  );
  const eventFilter = encodeURIComponent(
    JSON.stringify({ "subject@eq": `/party_membership/${record.id}` }),
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
                    as={RouterLink}
                    to={`/party/${record.party_id}/membership/${record.id}`}
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
                    as={RouterLink}
                    to={`/party/${record.party_id}/membership_history?filter=${historyFilter}`}
                  >
                    <div className="flex items-center gap-2">
                      {translate("text.tab.history")}
                    </div>
                  </Dropdown.Menu.GroupedList.Item>
                )}
                {canReadEvent && (
                  <Dropdown.Menu.GroupedList.Item
                    as={RouterLink}
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

export const PartyMembershipList = () => {
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const t = useTranslateField();
  const translate = useTranslate();
  const navigate = useNavigate();
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const { data, isLoading, error } = usePartyMemberships(Number(id));

  const isFISO =
    identity?.role === "flex_flexibility_information_system_operator";

  const canRead = permissions?.allow("party_membership", "read");
  const canCreate = permissions?.allow("party_membership", "create");
  const canLookup = permissions?.allow("entity", "lookup");

  if (!canRead) return null;

  const columns: ColumnOf<typeof data>[] = [
    { key: "id", header: t("party_membership.id") },
    {
      key: "entity",
      header: t("party_membership.entity_id"),
      render: (_, row) => row.entity?.name ?? row.entity_id,
    },
    {
      key: "entity_id",
      header: t("entity.business_id"),
      render: (_, row) => row.entity?.business_id ?? "",
    },
    {
      key: "scopes",
      header: t("party_membership.scopes"),
      render: (value) => (
        <Chips>
          {(value as string[]).map((scope) => (
            <Chips.Chip key={scope}>{scope}</Chips.Chip>
          ))}
        </Chips>
      ),
    },
    {
      key: "recorded_at",
      header: t("party_membership.recorded_at"),
      render: (value) => formatDate(String(value), "dd.MM.yyyy HH:mm"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <AddPartyMemberViaEntityLookupModal
        partyId={id}
        open={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
      />
      <div className="flex justify-end">
        {canCreate && isFISO && <CreateButton id={id} />}
        {canCreate && canLookup && (
          <Button
            onClick={() => setLookupModalOpen(true)}
            variant="invisible"
            icon={IconSearch}
          >
            Add new member
          </Button>
        )}
        <NestedResourceHistoryButton child="membership" label="View History" />
      </div>
      <SimpleTable
        data={data ?? []}
        columns={columns}
        rowActions={(row) => <RowActionsMenu record={row} />}
        rowClick={(row) => navigate(`/entity/${row.entity_id}/show`)}
        className="w-full"
        loading={isLoading}
        empty={error ? translate("text.simple_table.load_error") : undefined}
      />
    </div>
  );
};
