import { Form, useGetIdentity, useRecordContext, UserIdentity } from "ra-core";
import { useTypedNavigate, useTypedLocationState } from "../../routes";
import { useNavigate } from "react-router-dom";
import { ValidTimeTooltip } from "../../components/ValidTimeTooltip";
import { getFields, unTypedZodResolver } from "../../zod";
import { countDefinedValues } from "../../util";
import {
  zControllableUnitServiceProvider,
  zControllableUnitServiceProviderCreateRequest,
} from "../../generated-client/zod.gen";
import { ControllableUnitServiceProvider } from "../../generated-client";
import { FormContainer, Heading, FlexDiv } from "../../components/ui";
import {
  TextInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbar,
  DateInput,
} from "../../components/EDS-ra/inputs";
import { formatISO, parse } from "date-fns";

export type ControllableUnitServiceProviderLocationState = {
  cusp?: Partial<ControllableUnitServiceProvider>;
  // if we came to this page as a user who cannot see the CU, we want to input a
  // CU ID, instead of using the autocomplete component that works from the list
  // of readable CUs
  cuIDAsNumber?: boolean;
};

export const ControllableUnitServiceProviderInput = () => {
  const locationState = useTypedLocationState("cu_service_provider_create");
  const { cusp, cuIDAsNumber } = locationState ?? {};
  const actualRecord = useRecordContext<ControllableUnitServiceProvider>();

  const overrideRecord = zControllableUnitServiceProvider.partial().parse({
    ...cusp,
    // if valid_from is given by CU create page, it will be a date (YYYY-MM-DD)
    // and needs to be converted to a locally midnight-aligned datetime
    valid_from: cusp?.valid_from
      ? formatISO(parse(cusp.valid_from as string, "yyyy-MM-dd", new Date()))
      : undefined,
  });

  const hasOverride = countDefinedValues(overrideRecord) > 0;

  const overridenRecord = {
    ...actualRecord,
    ...overrideRecord,
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
  const navigate = useTypedNavigate();
  const navigateBack = useNavigate();
  const isServiceProvider = identity?.role == "flex_service_provider";
  const recordWithPartyId = isServiceProvider
    ? {
        ...record,
        service_provider_id: identity?.partyID,
      }
    : record;

  const onCancel = () => {
    if (!record.controllable_unit_id) {
      navigateBack(-1);
      return;
    }

    navigate({
      to: "controllable_unit_show",
      params: { id: String(record.controllable_unit_id) },
    });
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
          <DateInput {...fields.valid_from} outputFormat="date-time" />
          <DateInput {...fields.valid_to} outputFormat="date-time" />
        </FlexDiv>

        <FormToolbar onCancel={onCancel} saveAlwaysEnabled={hasOverride} />
      </FormContainer>
    </Form>
  );
};
