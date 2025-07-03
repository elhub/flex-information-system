import {
  List,
  Button,
  DeleteButton,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  TopToolbar,
  useGetList,
  usePermissions,
  useRecordContext,
  SortPayload,
} from "react-admin";
import { Datagrid } from "../../auth";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { DateField } from "../../components/datetime";
import { IdentityField } from "../../components/IdentityField";
import { useState } from "react";

export const PartyMembershipList = () => {
  // id of the SPG
  const { id } = useRecordContext()!;
  const { permissions } = usePermissions();

  const [sort, setSort] = useState<SortPayload>({ field: "id", order: "DESC" });
  const { data, isLoading } = useGetList("party_membership", {
    filter: { party_id: id },
    sort,
  });

  const CreateButton = () => (
    <Button
      component={Link}
      to={`/party/${id}/membership/create`}
      startIcon={<AddIcon />}
      state={{ party_id: id }}
      label="Create"
    />
  );

  const ListActions = () => (
    <TopToolbar>
      {permissions.includes("party_membership.create") && <CreateButton />}
    </TopToolbar>
  );

  return (
    permissions.includes("party_membership.read") && (
      <ResourceContextProvider value="party_membership">
        <List
          perPage={10}
          actions={<ListActions />}
          exporter={false}
          empty={false}
        >
          <Datagrid
            bulkActionButtons={false}
            data={data}
            sort={sort}
            setSort={setSort}
            isLoading={isLoading}
            rowClick={(_id, _res, record) =>
              `/party/${record.party_id}/membership/${record.id}/show`
            }
          >
            <TextField source="id" label="ID" />
            <ReferenceField source="entity_id" reference="entity">
              <TextField source="name" />
            </ReferenceField>
            <DateField source="recorded_at" showTime />
            <IdentityField source="recorded_by" />
            {permissions.includes("party_membership.delete") && (
              <DeleteButton mutationMode="pessimistic" redirect="" />
            )}
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};
