import {
  Button,
  Datagrid,
  List,
  ReferenceField,
  ResourceContextProvider,
  TextField,
  useGetIdentity,
  useLogin,
  useNotify,
  usePermissions,
  useRecordContext,
  useRedirect,
  useRefresh,
  useResetStore,
} from "react-admin";
import Box from "@mui/material/Box";
import {
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useState, useEffect } from "react";
import { docsURL } from "./httpConfig";

export const AssumePartyPage = () => {
  const [loading, setLoading] = useState(false);
  const [unAssumed, setUnAssumed] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const login = useLogin();
  const identity = useGetIdentity();
  const permissions = usePermissions();

  // refresh pagination information in resources after assuming a party
  const resetStore = useResetStore();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (identity.isPending) return;
    if (!unAssumed && identity.data!.role !== "flex_entity") {
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

  const AssumePartyButton = ({ field }: any) => {
    const record = useRecordContext()!;
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
      <Button label="Act on behalf of this party" onClick={assumeParty}>
        <>
          <PeopleAltIcon />
          {loading && <CircularProgress size={25} thickness={2} />}
        </>
      </Button>
    );
  };

  return (
    <>
      <Box m={1} />
      <Card>
        <CardHeader title="Assume a party" />
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
      <Box m={1} />
      <Typography variant="h6" margin={1}>
        Parties you belong to
      </Typography>
      {identity.isLoading ? (
        <CircularProgress size={25} thickness={2} />
      ) : (
        <List
          title="Assume a party"
          actions={false}
          perPage={25}
          sort={{ field: "id", order: "ASC" }}
          filter={{ entity_id: identity.data!.entityID }}
          empty={
            <Box textAlign="center" m={1}>
              <Typography variant="h5">
                You do not belong to any party.
              </Typography>
            </Box>
          }
        >
          <Datagrid bulkActionButtons={false}>
            <TextField label="ID" source="party_id" />
            <AssumePartyButton field="party_id" />
            <ReferenceField label="Name" source="party_id" reference="party">
              <TextField source="name" />
            </ReferenceField>
            <ReferenceField label="Type" source="party_id" reference="party">
              <TextField source="type" />
            </ReferenceField>
          </Datagrid>
        </List>
      )}
      <Typography variant="h6" margin={1}>
        Parties you own
      </Typography>
      {identity.isLoading ? (
        <CircularProgress size={25} thickness={2} />
      ) : (
        <ResourceContextProvider value="party">
          <List
            title={false}
            actions={false}
            perPage={5}
            sort={{ field: "id", order: "ASC" }}
            filter={{ entity_id: identity.data!.entityID }}
            empty={
              <Box textAlign="center" m={1}>
                <Typography variant="h5">You do not own any party.</Typography>
              </Box>
            }
          >
            <Datagrid bulkActionButtons={false}>
              <TextField label="ID" source="id" />
              <AssumePartyButton field="id" />
              <TextField source="name" />
              <TextField source="type" />
            </Datagrid>
          </List>
        </ResourceContextProvider>
      )}
    </>
  );
};
