import {
  ResourceContextProvider,
  useGetIdentity,
  useListContext,
  useLogin,
  useNotify,
  usePermissions,
  useRecordContext,
  useRedirect,
  useRefresh,
  useResetStore,
} from "ra-core";
import {
  Alert,
  BodyText,
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Loader,
} from "./components/ui";
import { useState, useEffect } from "react";
import { docsURL } from "./httpConfig";
import { Datagrid, List } from "./components/EDS-ra/list";
import {
  EnumField,
  ReferenceField,
  ScopesField,
  TextField,
} from "./components/EDS-ra/fields";

const AssumePartyButton = ({ field }: any) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const record = useRecordContext()!;
  const permissions = usePermissions();
  const login = useLogin();
  const identity = useGetIdentity();
  const [loading, setLoading] = useState(false);
  const assumeParty = async () => {
    setLoading(true);
    return login({ party_id: record[field] })
      .then(() => {
        identity?.refetch();
        permissions.refetch();
      })
      .then(() => {
        setLoading(false);
        redirect("/");
      })
      .catch((error: Error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message,
          { type: "error" },
        );
      });
  };

  return (
    <Button
      variant="primary"
      size="small"
      onClick={assumeParty}
      disabled={loading}
    >
      {loading && <Loader size="small" />}
      Act on behalf of {record.name}
    </Button>
  );
};

const PartyMembershipEmpty = () => {
  const { total, isPending } = useListContext();
  if (isPending || total !== 0) return null;
  return (
    <Alert variant="info" className="gap-4">
      <Heading size="small">No party membership</Heading>
      <BodyText>
        You are not a member of any party yet. If you are a new user, please
        contact your organisation party administrator in order to be added to
        one of your company{"'"}s parties.
      </BodyText>
    </Alert>
  );
};

export const AssumePartyPage = () => {
  const [unAssumed, setUnAssumed] = useState(false);
  const refresh = useRefresh();
  const login = useLogin();
  const identity = useGetIdentity();

  // refresh pagination information in resources after assuming a party
  const resetStore = useResetStore();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (identity.isPending) return;
    if (!unAssumed && identity.data!.partyID != undefined) {
      login({ party_id: null })
        .then(() => {
          setUnAssumed(true);
          return identity.refetch();
        })
        .then(() => {
          resetStore();
          refresh();
        });
    }
  }, [identity.isPending]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="flex flex-col gap-2">
      <Card>
        <CardHeader>Assume a party</CardHeader>
        <CardContent>
          You are now logged in to the Flexibility Information System. Your
          permissions may be restricted unless you <i>assume a party</i>. Below
          is a list of parties you are allowed to assume. Feel free to select
          one of them to act on behalf of it.
          <p>
            You can also check the{" "}
            <a href={`${docsURL}/guides/getting-started`}>tutorial</a> or the{" "}
            <a href={docsURL}>documentation</a> to get started.
          </p>
        </CardContent>
      </Card>
      <Heading level={2} size="small">
        Parties you belong to
      </Heading>
      {identity.isLoading ? (
        <Loader size="medium" />
      ) : (
        <List
          perPage={25}
          sort={{ field: "id", order: "ASC" }}
          filter={{ entity_id: identity.data?.entityID ?? "" }}
          empty={false}
          disableSyncWithLocation
        >
          <PartyMembershipEmpty />
          <Datagrid>
            <TextField hideLabel label="ID" source="party_id" />
            <ReferenceField hideLabel label="Name" source="party_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField hideLabel label="Type" source="party_id" reference="party">
              <EnumField source="type" enumKey="party.type" />
            </ReferenceField>
            <ScopesField source="scopes" />
            <ReferenceField
              label="Assume party"
              source="party_id"
              reference="party"
              hideLabel
            >
              <AssumePartyButton field="id" />
            </ReferenceField>
          </Datagrid>
        </List>
      )}
      <Heading level={2} size="small">
        Parties you own
      </Heading>
      {identity.isLoading ? (
        <Loader size="medium" />
      ) : (
        <ResourceContextProvider value="party">
          <List
            perPage={5}
            sort={{ field: "id", order: "ASC" }}
            filter={{ entity_id: identity.data!.entityID }}
            empty={false}
            disableSyncWithLocation
          >
            <Datagrid rowClick={false}>
              <TextField hideLabel source="id" />
              <TextField hideLabel source="name" />
              <EnumField source="type" enumKey="party.type" />
              <ReferenceField
                label="Assume party"
                source="id"
                reference="party"
                hideLabel
              >
                <AssumePartyButton field="id" />
              </ReferenceField>
            </Datagrid>
          </List>
        </ResourceContextProvider>
      )}
    </div>
  );
};
