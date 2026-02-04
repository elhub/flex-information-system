import {
  useRecordContext,
  RecordContextProvider,
  ResourceContextProvider,
  useGetOne,
} from "ra-core";
import { Alert, AlertTitle } from "@mui/material";
import { Link } from "react-router-dom";
import { IconPlus, IconPencil } from "@elhub/ds-icons";
import {
  BodyText,
  Button,
  Content,
  FlexDiv,
  Heading,
  VerticalSpace,
} from "../components/ui";
import {
  Datagrid,
  DateField,
  EnumField,
  TextField,
} from "../components/EDS-ra";
import { ProductTypeArrayField } from "../product_type/components";
import { PartyInputLocationState } from "../party/PartyInput";
import { DiffTextField } from "../components/EDS-ra/fields/DiffTextField";
import { Party } from "../generated-client";

type PartyUpdateButtonProps = {
  party_id: string;
  disabled?: boolean;
};

// button to jump to the party input page in update mode with autofilled form
const PartyUpdateButton = ({ party_id, disabled }: PartyUpdateButtonProps) => {
  const record = useRecordContext()!;

  return (
    <Button
      as={Link}
      to={`/party/${party_id}`}
      state={record}
      icon={IconPencil}
      disabled={disabled}
    >
      Update party
    </Button>
  );
};

type PartyCreateButtonProps = {
  disabled?: boolean;
};

// button to jump to the party input page in create mode with autofilled form
const PartyCreateButton = ({ disabled }: PartyCreateButtonProps) => {
  const record = useRecordContext<Party>()!;
  const locationState: PartyInputLocationState = { party: record };

  return (
    <Button
      as={Link}
      to="/party/create"
      state={locationState}
      icon={IconPlus}
      disabled={disabled}
    >
      Create party
    </Button>
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
    <>
      <Heading level={3} size="xsmall" spacing>
        A party is missing in the system.
      </Heading>
      <VerticalSpace />

      <BodyText weight="bold">Entity owning the missing party</BodyText>
      <VerticalSpace size="small" />
      <ResourceContextProvider value="entity">
        <RecordContextProvider value={record.data.entity}>
          <Content>
            <TextField source="business_id" label />
            <EnumField
              source="business_id_type"
              enumKey="entity.business_id_type"
              label
            />
            <TextField source="name" label />
            <EnumField source="type" enumKey="entity.type" label />
          </Content>
          <VerticalSpace size="small" />
          {entityAlert}
        </RecordContextProvider>
      </ResourceContextProvider>

      <VerticalSpace />
      <BodyText weight="bold">Missing party</BodyText>
      <VerticalSpace size="small" />
      <ResourceContextProvider value="party">
        <RecordContextProvider value={record.data.party}>
          <Content>
            <TextField source="business_id" label />
            <EnumField
              source="business_id_type"
              enumKey="party.business_id_type"
              label
            />
            <TextField source="entity_id" label />
            <TextField source="name" label />
            <EnumField source="type" enumKey="party.type" label />
          </Content>
          <VerticalSpace size="small" />
          <PartyCreateButton disabled={!entityExists} />
        </RecordContextProvider>
      </ResourceContextProvider>
    </>
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
    <>
      <Heading level={3} size="xsmall" spacing>
        A party is outdated in the system.
      </Heading>
      <VerticalSpace />

      <BodyText weight="bold">Entity owning the party</BodyText>
      <VerticalSpace size="small" />
      {entityChanged ? (
        <ResourceContextProvider value="entity">
          <RecordContextProvider value={record.data.entity}>
            <Content>
              <TextField source="business_id" label />
              <EnumField
                source="business_id_type"
                enumKey="entity.business_id_type"
                label
              />
              <TextField source="name" label />
              <EnumField source="type" enumKey="entity.type" label />
            </Content>
            <VerticalSpace size="small" />
            {entityExists ? (
              <Alert severity="success">
                <AlertTitle>Found</AlertTitle>
                The updated entity already exists in the system.
              </Alert>
            ) : (
              <Alert severity="warning">
                <AlertTitle>Not found</AlertTitle>
                The owning entity was updated to a new one that does not exist
                in the system. It must be created before the outdated party can
                be updated.
              </Alert>
            )}
          </RecordContextProvider>
        </ResourceContextProvider>
      ) : (
        <Alert severity="info">
          <AlertTitle>No entity change</AlertTitle>
          The owning entity was not updated as part of the fetched changes that
          were made to the current party.
        </Alert>
      )}

      <VerticalSpace />
      <BodyText weight="bold">Updated party information</BodyText>
      <VerticalSpace size="small" />
      <ResourceContextProvider value="party">
        <FlexDiv style={{ flexDirection: "column", gap: "1rem" }}>
          <Datagrid
            rowClick={false}
            data={[
              { ...outdatedParty, isNewRecord: false, id: "old" },
              { ...record.data.party, isNewRecord: true, id: "new" },
            ]}
          >
            <TextField source="business_id" />
            <TextField source="business_id_type" />
            <DiffTextField source="entity_id" changed={entityChanged} />
            <DiffTextField source="name" changed={nameChanged} />
            <TextField source="type" />
          </Datagrid>
          <PartyUpdateButton
            party_id={partyID}
            disabled={entityChanged && !entityExists}
          />
        </FlexDiv>
      </ResourceContextProvider>
    </>
  );
};

// component to show details of a notice of type
// no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract
const NoticeCUSPValidTimeOutsideContractShow = () => {
  const record = useRecordContext()!;

  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        Inconsistency: Controllable unit service provider / Accounting point end
        user.
      </Heading>
      <VerticalSpace />
      <BodyText>
        The following time intervals are the valid time sections of the
        Controllable Unit Service Provider relation where the end user given in
        the contract is not the one behind the accounting point:
      </BodyText>
      <VerticalSpace />
      <ResourceContextProvider value="controllable_unit_service_provider">
        <Datagrid
          rowClick={false}
          data={record.data.invalid_timeline.map(
            (item: object, index: number) => ({
              ...item,
              id: index,
            }),
          )}
        >
          <DateField source="valid_from" />
          <DateField source="valid_to" />
        </Datagrid>
      </ResourceContextProvider>
    </>
  );
};

// component to show details of a notice of type
// no.elhub.flex.service_provider_product_suspension.product_type.not_qualified
const NoticeSPPSProductTypeNotQualifiedShow = () => {
  const record = useRecordContext()!;

  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        The following product types are not qualified for the service provider:
      </Heading>
      <VerticalSpace />
      <RecordContextProvider value={record.data}>
        <ProductTypeArrayField
          label="field.service_provider_product_suspension.product_type_ids"
          source="product_type_ids"
        />
      </RecordContextProvider>
    </>
  );
};

export const NoticeShowDetails = () => {
  const record = useRecordContext();

  switch (record?.type) {
    case "no.elhub.flex.party.outdated":
      return <NoticePartyOutdatedShow />;
    case "no.elhub.flex.party.missing":
      return <NoticePartyMissingShow />;
    case "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract":
      return <NoticeCUSPValidTimeOutsideContractShow />;
    case "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified":
      return <NoticeSPPSProductTypeNotQualifiedShow />;
    default:
      return <BodyText>No additional details on this notice.</BodyText>;
  }
};
