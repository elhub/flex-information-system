import { Form, useGetIdentity, UserIdentity } from "ra-core";
import { useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
import {
  ControllableUnit,
  createControllableUnit,
  createControllableUnitServiceProvider,
} from "../generated-client";
import {
  zControllableUnit,
  zControllableUnitCreateRequest,
  zControllableUnitServiceProviderCreateRequest,
} from "../generated-client/zod.gen";
import useLocationState from "../hooks/useLocationState";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading } from "../components/ui";
import {
  TextInput,
  EnumInput,
  AutocompleteReferenceInput,
  PartyReferenceInput,
  FormToolbar,
  DateInput,
} from "../components/EDS-ra/inputs";
import { ControllableUnitInputLocationState } from "./ControllableUnitInput";
import z from "zod";
import { useState } from "react";
import { format, formatISO, isPast, parse } from "date-fns";

const zControllableUnitCreateForm = z.object({
  name: zControllableUnitCreateRequest.shape.name,
  regulation_direction:
    zControllableUnitCreateRequest.shape.regulation_direction,
  maximum_available_capacity:
    zControllableUnitCreateRequest.shape.maximum_available_capacity,
  accounting_point_id: zControllableUnitCreateRequest.shape.accounting_point_id,
  service_provider_id:
    zControllableUnitServiceProviderCreateRequest.shape.service_provider_id,
  end_user_id: zControllableUnitServiceProviderCreateRequest.shape.end_user_id,
  contract_reference:
    zControllableUnitServiceProviderCreateRequest.shape.contract_reference,
  start_date: zControllableUnitCreateRequest.shape.start_date
    .nonoptional()
    .refine((date) => isPast(date), {
      message: "Start date must be in the future",
    }),
});
type ControllableUnitCreateFormValues = z.infer<
  typeof zControllableUnitCreateForm
>;

export const ControllableUnitCreateForm = () => {
  const locationState = useLocationState<ControllableUnitInputLocationState>();
  const notify = useNotify();
  const navigate = useNavigate();

  const [savedControllableUnitId, setSavedControllableUnitId] = useState<
    number | undefined
  >(undefined);

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isServiceProvider =
    (identity as UserIdentity | undefined)?.role === "flex_service_provider";

  const controllableUnitOverride: Partial<ControllableUnit> = zControllableUnit
    .partial()
    .parse(locationState?.controllableUnit ?? {});

  const record: Partial<ControllableUnitCreateFormValues> = {
    regulation_direction: "up",
    maximum_available_capacity: 1,
    accounting_point_id: controllableUnitOverride.accounting_point_id,
    end_user_id: locationState?.endUserId,
    service_provider_id: isServiceProvider
      ? (identity as UserIdentity | undefined)?.partyID
      : undefined,
    start_date: controllableUnitOverride.start_date
      ? formatISO(
          parse(controllableUnitOverride.start_date, "yyyy-MM-dd", new Date()),
        )
      : format(new Date(), "yyyy-MM-dd"),
  };

  const fields = getFields(zControllableUnitCreateForm.shape);

  const onSubmit = async (values: object) => {
    const controllableUnitData = zControllableUnitCreateRequest.parse(values);

    const createdControllableUnit = savedControllableUnitId
      ? { data: { id: savedControllableUnitId }, error: undefined }
      : await createControllableUnit({ body: controllableUnitData });

    if (createdControllableUnit.error) {
      notify(createdControllableUnit.error.message, { type: "error" });
      return;
    }

    const controllableUnitServiceProviderData =
      zControllableUnitServiceProviderCreateRequest.parse({
        ...values,
        controllable_unit_id: createdControllableUnit.data.id,
        valid_from: controllableUnitData.start_date,
      });
    const createdControllableUnitServiceProvider =
      await createControllableUnitServiceProvider({
        body: {
          ...controllableUnitServiceProviderData,
          controllable_unit_id: createdControllableUnit.data.id,
          valid_from: controllableUnitData.start_date
            ? formatISO(
                parse(
                  controllableUnitData.start_date,
                  "yyyy-MM-dd",
                  new Date(),
                ),
              )
            : undefined,
        },
      });

    if (createdControllableUnitServiceProvider.error) {
      notify(createdControllableUnitServiceProvider.error.message, {
        type: "error",
      });
      setSavedControllableUnitId(createdControllableUnit.data.id);
      return;
    }

    notify("Controllable Unit created successfully", { type: "success" });
    navigate(`/controllable_unit/${createdControllableUnit.data.id}/show`);
  };

  return (
    <Form
      record={record}
      resolver={unTypedZodResolver(zControllableUnitCreateForm)}
      onSubmit={onSubmit}
    >
      <FormContainer>
        <Heading level={3} size="medium">
          Create Controllable Unit
        </Heading>
        <div className="flex flex-col gap-3">
          <TextInput {...fields.name} disabled={!!savedControllableUnitId} />
          <AutocompleteReferenceInput
            {...fields.accounting_point_id}
            disabled={!!savedControllableUnitId}
            reference="accounting_point"
          />
          <EnumInput
            {...fields.regulation_direction}
            enumKey="controllable_unit.regulation_direction"
            disabled={!!savedControllableUnitId}
          />
          <TextInput
            {...fields.maximum_available_capacity}
            type="number"
            disabled={!!savedControllableUnitId}
          />
        </div>
        <Heading level={3} size="medium">
          Service Provider Information
        </Heading>
        <div className="flex flex-col gap-3">
          <PartyReferenceInput
            {...fields.service_provider_id}
            resource="controllable_unit_service_provider"
            readOnly={isServiceProvider}
          />
          <TextInput
            {...fields.end_user_id}
            resource="controllable_unit_service_provider"
            type="number"
          />
          <TextInput
            {...fields.contract_reference}
            resource="controllable_unit_service_provider"
          />
          <DateInput {...fields.start_date} maxDate={new Date()} />
        </div>
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
