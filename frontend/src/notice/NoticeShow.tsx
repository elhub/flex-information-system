import {
  SimpleShowLayout,
  useRecordContext,
  Button,
  RecordContextProvider,
  TextField,
  ResourceContextProvider,
} from "react-admin";
import { Alert, AlertTitle, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import { FieldStack } from "../auth";

// button to jump to the party input page in update mode with autofilled form
const PartyUpdateButton = (props: any) => {
  const record = useRecordContext()!;
  const { party_id, ...rest } = props;

  return (
    <Button
      component={Link}
      to={`/party/${party_id}`}
      label="Update party"
      state={record}
      startIcon={<EditIcon />}
      {...rest}
    />
  );
};

// button to jump to the party input page in create mode with autofilled form
const PartyCreateButton = (props: any) => {
  const record = useRecordContext()!;
  return (
    <Button
      component={Link}
      to="/party/create"
      label="Create party"
      state={record}
      startIcon={<PersonAddIcon />}
      {...props}
    />
  );
};

// component to show details of a notice of type no.elhub.flex.party.missing
const NoticePartyMissingShow = () => {
  const record = useRecordContext()!;

  const entityExists = record.data.party?.entity_id != undefined;

  const entityAlert = entityExists ? (
    <Alert severity="success">
      <AlertTitle>Found</AlertTitle>
      The entity owning the missing party already exists in the system.
    </Alert>
  ) : (
    <Alert severity="warning">
      <AlertTitle>Not found</AlertTitle>
      The owning entity of the missing party is also missing from the system. It
      must be created before the missing party can be added.
    </Alert>
  );

  return (
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          A party is missing in the system.
        </Typography>
        <Typography gutterBottom>Entity owning the missing party</Typography>
        <ResourceContextProvider value="entity">
          <RecordContextProvider value={record.data.entity}>
            <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
              <TextField source="business_id" label="Business ID" />
              <TextField source="business_id_type" label="Business ID Type" />
              <TextField source="name" />
              <TextField source="type" />
              {entityAlert}
            </FieldStack>
          </RecordContextProvider>
        </ResourceContextProvider>

        <Typography gutterBottom>Missing party</Typography>
        <ResourceContextProvider value="party">
          <RecordContextProvider value={record.data.party}>
            <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
              <TextField source="business_id" label="Business ID" />
              <TextField source="business_id_type" label="Business ID Type" />
              <TextField source="entity_id" label="Entity ID" />
              <TextField source="name" />
              <TextField source="type" />
              <PartyCreateButton disabled={!entityExists} />
            </FieldStack>
          </RecordContextProvider>
        </ResourceContextProvider>
      </Stack>
    </SimpleShowLayout>
  );
};

// component to show details of a notice of type no.elhub.flex.party.outdated
const NoticePartyOutdatedShow = () => {
  const record = useRecordContext()!;

  const entityChanged = record.data.entity?.business_id != undefined;
  const entityExists = record.data.party?.entity_id != undefined;

  return (
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          A party is outdated in the system.
        </Typography>
        <Typography gutterBottom>Entity owning the party</Typography>
        {entityChanged ? (
          <ResourceContextProvider value="entity">
            <RecordContextProvider value={record.data.entity}>
              <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
                <TextField source="business_id" label="Business ID" />
                <TextField source="business_id_type" label="Business ID Type" />
                <TextField source="name" />
                <TextField source="type" />
                {entityExists ? (
                  <Alert severity="success">
                    <AlertTitle>Found</AlertTitle>
                    The updated entity already exists in the system.
                  </Alert>
                ) : (
                  <Alert severity="warning">
                    <AlertTitle>Not found</AlertTitle>
                    The owning entity was updated to a new one that does not
                    exist in the system. It must be created before the outdated
                    party can be updated.
                  </Alert>
                )}
              </FieldStack>
            </RecordContextProvider>
          </ResourceContextProvider>
        ) : (
          <FieldStack direction="row" flexWrap="wrap">
            <Alert severity="info">
              <AlertTitle>No entity change</AlertTitle>
              The owning entity was not updated as part of the fetched changes
              that were made to the current party.
            </Alert>
          </FieldStack>
        )}
        <Typography gutterBottom>Updated party information</Typography>
        <ResourceContextProvider value="party">
          <RecordContextProvider value={record.data.party}>
            <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
              <TextField source="business_id" label="Business ID" />
              <TextField source="business_id_type" label="Business ID Type" />
              <TextField source="entity_id" label="Entity ID" />
              <TextField source="name" />
              <TextField source="type" />
              <PartyUpdateButton
                party_id={record.source.split("/")[2]}
                disabled={entityChanged && !entityExists}
              />
            </FieldStack>
          </RecordContextProvider>
        </ResourceContextProvider>
      </Stack>
    </SimpleShowLayout>
  );
};

// component to show details of a notice of type
// no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract
const NoticeCUSPValidTimeOutsideContractShow = () => {
  return "todo";
};

export const NoticeShow = () => {
  const record = useRecordContext()!;

  switch (record.type) {
    case "no.elhub.flex.party.outdated":
      return <NoticePartyOutdatedShow />;
    case "no.elhub.flex.party.missing":
      return <NoticePartyMissingShow />;
    case "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract":
      return <NoticeCUSPValidTimeOutsideContractShow />;
    default:
      return (
        <Typography gutterBottom>
          No additional details on this notice.
        </Typography>
      );
  }
};
