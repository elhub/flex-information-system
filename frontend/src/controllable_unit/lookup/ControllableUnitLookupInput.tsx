import { Form, useNotify } from "ra-core";
import { useNavigate } from "react-router-dom";
import { callControllableUnitLookup } from "../../generated-client";
import { zControllableUnitLookupRequest } from "../../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../../zod";
import { FormContainer, Heading } from "../../components/ui";
import { TextInput, FormToolbar } from "../../components/EDS-ra/inputs";

export const ControllableUnitLookupInput = () => {
  const navigate = useNavigate();
  const notify = useNotify();

  const keys = getFields(zControllableUnitLookupRequest.shape);

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

    if (response.data.controllable_units.length === 0) {
      const params = new URLSearchParams({
        accounting_point_id: String(response.data.accounting_point.id),
        end_user_id: String(response.data.end_user.id),
      });
      navigate(`/controllable_unit/create?${params.toString()}`);
      return;
    }

    return navigate("/controllable_unit/lookup/result", {
      state: { result: response.data },
    });
  };

  return (
    <Form
      resolver={unTypedZodResolver(zControllableUnitLookupRequest)}
      onSubmit={lookup}
    >
      <FormContainer className="max-w-xl mt-4 py-4">
        <Heading level={3} size="medium">
          User details
        </Heading>
        <TextInput
          description
          descriptionOverride="Organisation number or birth number of the end user"
          overrideLabel="End user"
          tooltip={false}
          {...keys.end_user}
        />
        <TextInput
          description
          descriptionOverride="GSRN of the accounting point"
          overrideLabel="Accounting point"
          tooltip={false}
          {...keys.accounting_point}
          required
        />
        <FormToolbar saveLabel="Next" className="flex-row-reverse w-full" />
      </FormContainer>
    </Form>
  );
};
