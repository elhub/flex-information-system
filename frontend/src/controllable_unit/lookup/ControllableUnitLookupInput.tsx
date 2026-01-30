import { Form, useNotify } from "ra-core";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { callControllableUnitLookup } from "../../generated-client";
import { zControllableUnitLookupRequest } from "../../generated-client/zod.gen";
import { unTypedZodResolver } from "../../util";
import {
  FormContainer,
  Heading,
  VerticalSpace,
  BodyText,
  FlexDiv,
} from "../../components/ui";
import { TextInput, FormToolbar } from "../../components/EDS-ra/inputs";

const ControllableUnitLookupForm = () => {
  const { watch } = useFormContext();
  const controllableUnit = watch("controllable_unit");
  const accountingPoint = watch("accounting_point");

  const accountingPointDisabled =
    controllableUnit && controllableUnit.length > 0;
  const controllableUnitDisabled =
    accountingPoint && accountingPoint.length > 0;

  return (
    <FlexDiv style={{ gap: "var(--eds-size-3)", flexWrap: "wrap" }}>
      <TextInput
        source="end_user"
        required
        overrideLabel="End user"
        tooltip={false}
      />
      <TextInput
        source="accounting_point"
        disabled={accountingPointDisabled}
        overrideLabel="Accounting point"
        tooltip={false}
      />
      <TextInput
        source="controllable_unit"
        disabled={controllableUnitDisabled}
        overrideLabel="Controllable unit"
        tooltip={false}
      />
    </FlexDiv>
  );
};

// page to enter data required for controllable unit lookup
export const ControllableUnitLookupInput = () => {
  const { state } = useLocation();
  const defaultControllableUnit = state?.controllable_unit as
    | string
    | undefined;

  const navigate = useNavigate();
  const notify = useNotify();

  // launch lookup request
  const lookup = async (data: unknown) => {
    const lookupRequest = zControllableUnitLookupRequest.safeParse(data);

    if (!lookupRequest.success) {
      // You should not end up here since zod validation is done before submission
      notify("Invalid input data", { type: "error" });
      return;
    }

    const response = await callControllableUnitLookup({
      body: lookupRequest.data,
    });

    if (response.error) {
      // error, just notify the user like in the other pages
      notify(response.error.message, { type: "error" });
      return;
    }
    // navigate to the dedicated show page for the result
    return navigate("/controllable_unit/lookup/result", {
      state: { result: response.data },
    });
  };

  return (
    <Form
      defaultValues={{ controllable_unit: defaultControllableUnit }}
      resolver={unTypedZodResolver(zControllableUnitLookupRequest)}
      onSubmit={lookup}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Lookup a controllable unit
        </Heading>
        <VerticalSpace />
        <BodyText>
          This operation allows you to get information about one or several
          controllable units registered in the Flexibility Information System,
          in order to, for instance, create controllable unit service provider
          resources.
        </BodyText>
        <BodyText>
          Input the business ID of the end user behind the controllable unit,
          and either the GSRN of the accounting point or the business ID of the
          controllable unit.
        </BodyText>
        <VerticalSpace />
        <ControllableUnitLookupForm />
        <FormToolbar saveLabel="Lookup" />
      </FormContainer>
    </Form>
  );
};
