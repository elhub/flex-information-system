import {
  Identifier,
  ResourceContextProvider,
  useGetIdentity,
  usePermissions,
  useRecordContext,
} from "ra-core";
import { useState } from "react";
import { List, Datagrid } from "../../components/EDS-ra/list";
import {
  DeleteButton,
  DateField,
  ReferenceField,
  ScopesField,
  TextField,
  NestedResourceHistoryButton,
} from "../../components/EDS-ra";
import { Button } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { Permissions } from "../../auth/permissions";
import { IconPlus, IconSearch } from "@elhub/ds-icons";
import { AddPartyMemberViaEntityLookupModal } from "./AddPartyMemberViaEntityLookupModal";

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

const ListActions = ({
  permissions,
  id,
  isFISO,
  onOpenLookupModal,
}: {
  permissions: Permissions | undefined;
  id: Identifier;
  isFISO: boolean;
  onOpenLookupModal: () => void;
}) => {
  const canCreate = permissions?.allow("party_membership", "create");
  const canLookup = permissions?.allow("entity", "lookup");

  return (
    <>
      {canCreate && isFISO && <CreateButton id={id} />}
      {canCreate && canLookup && (
        <Button
          onClick={onOpenLookupModal}
          variant="invisible"
          icon={IconSearch}
        >
          Add new member
        </Button>
      )}
      <NestedResourceHistoryButton child="membership" label="View History" />
    </>
  );
};

export const PartyMembershipList = ({
  borderless = false,
}: {
  borderless?: boolean;
}) => {
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions<Permissions>();
  const { data: identity } = useGetIdentity();
  const [lookupModalOpen, setLookupModalOpen] = useState(false);

  const isFISO =
    identity?.role === "flex_flexibility_information_system_operator";

  // Permission checks
  const canRead = permissions?.allow("party_membership", "read");
  const canDelete = permissions?.allow("party_membership", "delete");

  return (
    canRead && (
      <ResourceContextProvider value="party_membership">
        <AddPartyMemberViaEntityLookupModal
          partyId={id}
          open={lookupModalOpen}
          onClose={() => setLookupModalOpen(false)}
        />
        <List
          perPage={10}
          actions={[
            <ListActions
              key="actions"
              permissions={permissions}
              id={id}
              isFISO={isFISO}
              onOpenLookupModal={() => setLookupModalOpen(true)}
            />,
          ]}
          exporter={false}
          empty={false}
          borderless={borderless}
          filter={{ party_id: id }}
          sort={{ field: "id", order: "DESC" }}
        >
          <Datagrid
            rowClick={(record) => {
              return `/party/${record.party_id}/membership/${record.id}/show`;
            }}
          >
            <TextField source="id" />
            <ReferenceField source="entity_id" reference="entity">
              <TextField source="name" />
            </ReferenceField>
            <ScopesField source="scopes" />
            <DateField source="recorded_at" showTime />
            {canDelete && <DeleteButton />}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
