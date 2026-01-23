import {
  SimpleShowLayout,
  useRecordContext,
  Button,
  RecordContextProvider,
  TextField,
  ResourceContextProvider,
  DataTable,
  useGetOne,
} from "react-admin";
import { Alert, AlertTitle, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import { FieldStack } from "../auth";
import { DateField } from "../components/datetime";
import { ProductTypeArrayField } from "../product_type/components";
import { EnumField } from "../components/enum";
import { PartyInputLocationState } from "../party/PartyInput";

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
  const locationState: PartyInputLocationState = {
    party: record.data.party,
  };
  return (
    <Button
      component={Link}
      to="/party/create"
      label="Create party"
      state={locationState}
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
              <TextField
                source="business_id"
                label="field.entity.business_id"
              />
              <EnumField
                source="business_id_type"
                label="field.entity.business_id_type"
                enumKey="entity.business_id_type"
              />
              <TextField source="name" label="field.entity.name" />
              <EnumField
                source="type"
                label="field.entity.type"
                enumKey="entity.type"
              />
              {entityAlert}
            </FieldStack>
          </RecordContextProvider>
        </ResourceContextProvider>

        <Typography gutterBottom>Missing party</Typography>
        <ResourceContextProvider value="party">
          <RecordContextProvider value={record.data.party}>
            <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
              <TextField source="business_id" label="field.party.business_id" />
              <EnumField
                source="business_id_type"
                label="field.party.business_id_type"
                enumKey="party.business_id_type"
              />
              <TextField source="entity_id" label="field.party.entity_id" />
              <TextField source="name" label="field.party.name" />
              <EnumField
                source="type"
                label="field.party.type"
                enumKey="party.type"
              />
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
  const nameChanged = record.data.party?.name != undefined;
  const entityExists = record.data.party?.entity_id != undefined;

  const partyID = record.source.split("/")[2];

  const {
    data: outdatedParty,
    isPending,
    error,
  } = useGetOne("party", { id: partyID });

  return isPending || error ? null : (
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
                <TextField
                  source="business_id"
                  label="field.entity.business_id"
                />
                <EnumField
                  source="business_id_type"
                  label="field.entity.business_id_type"
                  enumKey="entity.business_id_type"
                />
                <TextField source="name" label="field.entity.name" />
                <EnumField
                  source="type"
                  label="field.entity.type"
                  enumKey="entity.type"
                />
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
        <RecordContextProvider value={record.data.party}>
          <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
            <DataTable
              bulkActionButtons={false}
              data={[
                { ...outdatedParty, isNewRecord: false },
                { ...record.data.party, isNewRecord: true },
              ]}
            >
              <DataTable.Col
                source="business_id"
                label="field.party.business_id"
                field={TextField}
              />
              <DataTable.Col
                source="business_id_type"
                label="field.party.business_id_type"
                field={TextField}
              />
              <DataTable.Col
                source="entity_id"
                label="field.party.entity_id"
                field={TextField}
                cellSx={(r) =>
                  entityChanged
                    ? r.isNewRecord
                      ? { color: "green" }
                      : { color: "red", textDecoration: "line-through" }
                    : {}
                }
              />
              <DataTable.Col
                source="name"
                label="field.party.name"
                field={TextField}
                cellSx={(r) =>
                  nameChanged
                    ? r.isNewRecord
                      ? { color: "green" }
                      : { color: "red", textDecoration: "line-through" }
                    : {}
                }
              />
              <DataTable.Col
                source="type"
                label="field.party.type"
                field={TextField}
              />
            </DataTable>
            <PartyUpdateButton
              party_id={partyID}
              disabled={entityChanged && !entityExists}
            />
          </FieldStack>
        </RecordContextProvider>
      </Stack>
    </SimpleShowLayout>
  );
};

// component to show details of a notice of type
// no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract
const NoticeCUSPValidTimeOutsideContractShow = () => {
  const record = useRecordContext()!;

  return (
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6">
          Inconsistency: Controllable unit service provider / Accounting point
          end user.
        </Typography>
        <Typography>
          The following time intervals are the valid time sections of the
          Controllable Unit Service Provider relation where the end user given
          in the contract is not the one behind the accounting point:
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
          <DataTable
            bulkActionButtons={false}
            data={record.data.invalid_timeline}
          >
            <DataTable.Col
              source="valid_from"
              label="field.controllable_unit_service_provider.valid_from"
              field={DateField}
            />
            <DataTable.Col
              source="valid_to"
              label="field.controllable_unit_service_provider.valid_to"
              field={DateField}
            />
          </DataTable>
        </FieldStack>
      </Stack>
    </SimpleShowLayout>
  );
};

// component to show details of a notice of type
// no.elhub.flex.service_provider_product_suspension.product_type.not_qualified
const NoticeSPPSProductTypeNotQualifiedShow = () => {
  const record = useRecordContext()!;

  return (
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          The following product types are not qualified for the service
          provider:
        </Typography>
        <RecordContextProvider value={record.data}>
          <FieldStack direction="row" flexWrap="wrap" spacing={2} allowAll>
            <ProductTypeArrayField
              label="field.service_provider_product_suspension.product_type_ids"
              source="product_type_ids"
            />
          </FieldStack>
        </RecordContextProvider>
      </Stack>
    </SimpleShowLayout>
  );
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
    case "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified":
      return <NoticeSPPSProductTypeNotQualifiedShow />;
    default:
      return (
        <Typography gutterBottom>
          No additional details on this notice.
        </Typography>
      );
  }
};
