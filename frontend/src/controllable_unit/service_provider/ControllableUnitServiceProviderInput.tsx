import { Form, useGetIdentity, useRecordContext, UserIdentity } from "ra-core";
import { useNavigate } from "react-router-dom";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";
import { formatDateToMidnightISO } from "../../components/datetime";
import { countDefinedValues, getFields, unTypedZodResolver } from "../../util";
import {
  zControllableUnitServiceProvider,
  zControllableUnitServiceProviderCreateRequest,
} from "../../generated-client/zod.gen";
import { ControllableUnitServiceProvider } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import { FormContainer, Heading, FlexDiv } from "../../components/ui";
import {
  TextInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  DateInput,
  FormToolbar,
} from "../../components/EDS-ra/inputs";

export type ControllableUnitServiceProviderLocationState = {
  cusp?: Partial<ControllableUnitServiceProvider>;
  // if we came to this page as a user who cannot see the CU, we want to input a
  // CU ID, instead of using the autocomplete component that works from the list
  // of readable CUs
  cuIDAsNumber?: boolean;
};

export const ControllableUnitServiceProviderInput = () => {
  const locationState =
    useLocationState<ControllableUnitServiceProviderLocationState>();
  const { cusp, cuIDAsNumber } = locationState ?? {};
  const actualRecord = useRecordContext<ControllableUnitServiceProvider>();

  const overrideRecord = zControllableUnitServiceProvider
    .partial()
    .parse(cusp ?? {});

  const hasOverride = countDefinedValues(overrideRecord) > 0;

  const overridenRecord = {
    ...actualRecord,
    ...overrideRecord,
    valid_from: overrideRecord?.valid_from
      ? formatDateToMidnightISO(overrideRecord?.valid_from)
      : actualRecord?.valid_from,
  } as ControllableUnitServiceProvider;

  const { data: identity, isLoading: identityLoading } = useGetIdentity();

  if (identityLoading) return <>Loading...</>;

  return (
    <ControllableUnitServiceProviderForm
      record={overridenRecord}
      hasOverride={hasOverride}
      cuIDAsNumber={!!cuIDAsNumber}
      identity={identity}
    />
  );
};

const ControllableUnitServiceProviderForm = ({
  record,
  hasOverride,
  cuIDAsNumber,
  identity,
}: {
  record: ControllableUnitServiceProvider;
  hasOverride: boolean;
  cuIDAsNumber: boolean;
  identity: UserIdentity | undefined;
}) => {
  const navigate = useNavigate();
  const isServiceProvider = identity?.role == "flex_service_provider";
  const recordWithPartyId = isServiceProvider
    ? {
        ...record,
        service_provider_id: identity?.partyID,
      }
    : record;

  const onCancel = () => {
    if (!record.controllable_unit_id) {
      navigate(-1);
      return;
    }

    navigate(`/controllable_unit/${record.controllable_unit_id}/show`);
  };

  const fields = getFields(zControllableUnitServiceProviderCreateRequest.shape);

  return (
    <Form
      record={recordWithPartyId}
      resolver={unTypedZodResolver(
        zControllableUnitServiceProviderCreateRequest,
      )}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Basic information
        </Heading>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          {cuIDAsNumber ? (
            <TextInput
              {...fields.controllable_unit_id}
              type="number"
              overrideLabel="Controllable unit ID"
            />
          ) : (
            <AutocompleteReferenceInput
              {...fields.controllable_unit_id}
              reference="controllable_unit"
              readOnly
            />
          )}
          <PartyReferenceInput
            {...fields.service_provider_id}
            readOnly={isServiceProvider}
          />
          <TextInput {...fields.end_user_id} type="number" />
        </FlexDiv>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <TextInput {...fields.contract_reference} />
        </FlexDiv>

        <FlexDiv
          style={{
            gap: "var(--eds-size-2)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Heading level={4} size="small">
            Valid time
          </Heading>
          <ValidTimeTooltip />
        </FlexDiv>

        <FlexDiv style={{ gap: "var(--eds-size-3)", flexDirection: "column" }}>
          <DateInput {...fields.valid_from} />
          <DateInput {...fields.valid_to} />
        </FlexDiv>

        <FormToolbar onCancel={onCancel} saveAlwaysEnabled={hasOverride} />
      </FormContainer>
    </Form>
  );
};
