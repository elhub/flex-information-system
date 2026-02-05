import {
  useRecordContext,
  RecordContextProvider,
  ResourceContextProvider,
  useGetOne,
} from "ra-core";
import { Link } from "react-router-dom";
import { IconPlus, IconPencil } from "@elhub/ds-icons";
import {
  Alert,
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
import { Party, Notice as GNotice } from "../generated-client";
import {
  zEntity,
  zParty,
  zControllableUnitServiceProvider,
  zNoticeDataProductTypeNotQualified,
} from "../generated-client/zod.gen";
import { getFields } from "../util";

type Notice = GNotice & {
  data: any;
};

type NoticeShowDetailsProps = {
  notice: Notice;
};

type PartyUpdateButtonProps = {
  party_id: string;
  disabled?: boolean;
  partyData: Party;
};

// button to jump to the party input page in update mode with autofilled form
const PartyUpdateButton = ({
  party_id,
  disabled,
  partyData,
}: PartyUpdateButtonProps) => (
  <Button
    as={Link}
    to={`/party/${party_id}`}
    state={partyData}
    icon={IconPencil}
    disabled={disabled}
  >
    Update party
  </Button>
);

type PartyCreateButtonProps = {
  partyData: Party;
  disabled?: boolean;
};

// button to jump to the party input page in create mode with autofilled form
const PartyCreateButton = ({ partyData, disabled }: PartyCreateButtonProps) => {
  const locationState: PartyInputLocationState = { party: partyData };

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
const NoticePartyMissingShowDetails = ({ notice }: NoticeShowDetailsProps) => {
  const entityExists = notice.data.party?.entity_id != undefined;

  const entityAlert = entityExists ? (
    <>
      <Alert variant="success">Found</Alert>
      <VerticalSpace />
      <BodyText>
        The entity owning the missing party already exists in the system.
      </BodyText>
    </>
  ) : (
    <>
      <Alert variant="warning">Not found</Alert>
      <VerticalSpace />
      <BodyText>
        The owning entity of the missing party is also missing from the system.
        It must be created before the missing party can be added.
      </BodyText>
    </>
  );

  const entityFields = getFields(zEntity.shape);
  const partyFields = getFields(zParty.shape);

  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        A party is missing in the system.
      </Heading>
      <VerticalSpace />

      <BodyText weight="bold">Entity owning the missing party</BodyText>
      <VerticalSpace size="small" />
      <ResourceContextProvider value="entity">
        <RecordContextProvider value={notice.data.entity}>
          <Content>
            <TextField source={entityFields.business_id.source} label />
            <EnumField
              source={entityFields.business_id_type.source}
              enumKey="entity.business_id_type"
              label
            />
            <TextField source={entityFields.name.source} label />
            <EnumField
              source={entityFields.type.source}
              enumKey="entity.type"
              label
            />
          </Content>
          <VerticalSpace size="small" />
          {entityAlert}
        </RecordContextProvider>
      </ResourceContextProvider>

      <VerticalSpace />
      <BodyText weight="bold">Missing party</BodyText>
      <VerticalSpace size="small" />
      <ResourceContextProvider value="party">
        <RecordContextProvider value={notice.data.party}>
          <Content>
            <TextField source={partyFields.business_id.source} label />
            <EnumField
              source={partyFields.business_id_type.source}
              enumKey="party.business_id_type"
              label
            />
            <TextField source={partyFields.entity_id.source} label />
            <TextField source={partyFields.name.source} label />
            <EnumField
              source={partyFields.type.source}
              enumKey="party.type"
              label
            />
          </Content>
          <VerticalSpace size="small" />
          <PartyCreateButton
            disabled={!entityExists}
            partyData={notice.data.party}
          />
        </RecordContextProvider>
      </ResourceContextProvider>
    </>
  );
};

// component to show details of a notice of type no.elhub.flex.party.outdated
const NoticePartyOutdatedShowDetails = ({ notice }: NoticeShowDetailsProps) => {
  const entityChanged = notice.data.entity?.business_id != undefined;
  const nameChanged = notice.data.party?.name != undefined;
  const entityExists = notice.data.party?.entity_id != undefined;

  const partyID = notice.source!.split("/")[2];

  const entityFields = getFields(zEntity.shape);
  const partyFields = getFields(zParty.shape);

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
      <VerticalSpace />
      {entityChanged ? (
        <ResourceContextProvider value="entity">
          <RecordContextProvider value={notice.data.entity}>
            <Content>
              <TextField source={entityFields.business_id.source} label />
              <EnumField
                source={entityFields.business_id_type.source}
                enumKey="entity.business_id_type"
                label
              />
              <TextField source={entityFields.name.source} label />
              <EnumField
                source={entityFields.type.source}
                enumKey="entity.type"
                label
              />
            </Content>
            <VerticalSpace size="small" />
            {entityExists ? (
              <>
                <Alert variant="success">Found</Alert>
                <VerticalSpace />
                <BodyText>
                  The updated entity already exists in the system.
                </BodyText>
              </>
            ) : (
              <>
                <Alert variant="warning">Not found</Alert>
                <VerticalSpace />
                <BodyText>
                  The owning entity was updated to a new one that does not exist
                  in the system. It must be created before the outdated party
                  can be updated.
                </BodyText>
              </>
            )}
          </RecordContextProvider>
        </ResourceContextProvider>
      ) : (
        <>
          <Alert variant="info">No entity change</Alert>
          <VerticalSpace />
          <BodyText>
            The owning entity was not updated as part of the fetched changes
            that were made to the current party.
          </BodyText>
        </>
      )}

      <VerticalSpace />
      <BodyText weight="bold">Updated party information</BodyText>
      <VerticalSpace />
      <ResourceContextProvider value="party">
        <FlexDiv style={{ flexDirection: "column", gap: "1rem" }}>
          <Datagrid
            rowClick={false}
            data={[
              { ...outdatedParty, isNewRecord: false, id: "old" },
              { ...notice.data.party, isNewRecord: true, id: "new" },
            ]}
          >
            <TextField source={partyFields.business_id.source} />
            <TextField source={partyFields.business_id_type.source} />
            <DiffTextField
              source={partyFields.entity_id.source}
              changed={entityChanged}
            />
            <DiffTextField
              source={partyFields.name.source}
              changed={nameChanged}
            />
            <TextField source={partyFields.type.source} />
          </Datagrid>
          <PartyUpdateButton
            party_id={partyID}
            partyData={notice.data.party}
            disabled={entityChanged && !entityExists}
          />
        </FlexDiv>
      </ResourceContextProvider>
    </>
  );
};

// component to show details of a notice of type
// no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract
const NoticeCUSPValidTimeOutsideContractShowDetails = ({
  notice,
}: NoticeShowDetailsProps) => {
  const cuspFields = getFields(zControllableUnitServiceProvider.shape);

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
          data={notice.data.invalid_timeline.map(
            (item: object, index: number) => ({
              ...item,
              id: index,
            }),
          )}
        >
          <DateField source={cuspFields.valid_from.source} />
          <DateField source={cuspFields.valid_to.source} />
        </Datagrid>
      </ResourceContextProvider>
    </>
  );
};

// component to show details of a notice of type
// no.elhub.flex.service_provider_product_suspension.product_type.not_qualified
const NoticeSPPSProductTypeNotQualifiedShowDetails = ({
  notice,
}: NoticeShowDetailsProps) => {
  const noticeDataFields = getFields(zNoticeDataProductTypeNotQualified.shape);

  return (
    <>
      <Heading level={3} size="xsmall" spacing>
        The following product types are not qualified for the service provider:
      </Heading>
      <VerticalSpace />
      <RecordContextProvider value={notice.data}>
        <ProductTypeArrayField
          label="field.service_provider_product_suspension.product_type_ids"
          source={noticeDataFields.product_type_ids.source}
        />
      </RecordContextProvider>
    </>
  );
};

export const NoticeShowDetails = () => {
  const record = useRecordContext<Notice>();

  switch (record?.type) {
    case "no.elhub.flex.party.outdated":
      return <NoticePartyOutdatedShowDetails notice={record} />;
    case "no.elhub.flex.party.missing":
      return <NoticePartyMissingShowDetails notice={record} />;
    case "no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract":
      return <NoticeCUSPValidTimeOutsideContractShowDetails notice={record} />;
    case "no.elhub.flex.service_provider_product_suspension.product_type.not_qualified":
      return <NoticeSPPSProductTypeNotQualifiedShowDetails notice={record} />;
    default:
      return <BodyText>No additional details on this notice.</BodyText>;
  }
};
