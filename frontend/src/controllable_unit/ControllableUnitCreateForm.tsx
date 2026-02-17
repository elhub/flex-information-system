import { Form, useGetIdentity, UserIdentity } from "ra-core";
import { useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
import {
  createControllableUnit,
  createControllableUnitServiceProvider,
} from "../generated-client";
import {
  zControllableUnitCreateRequest,
  zControllableUnitServiceProviderCreateRequest,
} from "../generated-client/zod.gen";
import { getFields, unTypedZodResolver } from "../zod";
import { FormContainer, Heading } from "../components/ui";
import {
  TextInput,
  EnumInput,
  PartyReferenceInput,
  FormToolbar,
  DateInput,
} from "../components/EDS-ra/inputs";
import z from "zod";
import { useState } from "react";
import { format, formatISO, isPast, parse } from "date-fns";

const zControllableUnitCreateForm = z.object({
  name: zControllableUnitCreateRequest.shape.name,
  regulation_direction:
    zControllableUnitCreateRequest.shape.regulation_direction,
  maximum_available_capacity:
    zControllableUnitCreateRequest.shape.maximum_available_capacity,
  service_provider_id:
    zControllableUnitServiceProviderCreateRequest.shape.service_provider_id,
  contract_reference:
    zControllableUnitServiceProviderCreateRequest.shape.contract_reference,
  // We want to ensure that the start date is not a future date so the user has access to change its values after creation.
  start_date: zControllableUnitCreateRequest.shape.start_date
    .nonoptional()
    .refine((date) => isPast(date), {
      message: "Start date must be today or a past date",
    }),
});
type ControllableUnitCreateFormValues = z.infer<
  typeof zControllableUnitCreateForm
>;

type ControllableUnitCreateFormProps = {
  accountingPointId: number;
  endUserId: number;
};

export const ControllableUnitCreateForm = ({
  accountingPointId,
  endUserId,
}: ControllableUnitCreateFormProps) => {
  const notify = useNotify();
  const navigate = useNavigate();

  // We need to save the id if the cu is created successfully but the cusp fails.
  const [savedControllableUnitId, setSavedControllableUnitId] = useState<
    number | undefined
  >(undefined);

  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  if (identityLoading) return <>Loading...</>;

  const isServiceProvider =
    (identity as UserIdentity | undefined)?.role === "flex_service_provider";

  const record: Partial<ControllableUnitCreateFormValues> = {
    regulation_direction: "up",
    maximum_available_capacity: 1,
    service_provider_id: isServiceProvider
      ? (identity as UserIdentity | undefined)?.partyID
      : undefined,
    start_date: format(new Date(), "yyyy-MM-dd"),
  };

  const fields = getFields(zControllableUnitCreateForm.shape);

  const onSubmit = async (values: object) => {
    const controllableUnitData = zControllableUnitCreateRequest.parse({
      ...values,
      accounting_point_id: accountingPointId,
      end_user_id: endUserId,
    });

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
        end_user_id: endUserId,
        valid_from: controllableUnitData.start_date
          ? formatISO(
              parse(controllableUnitData.start_date, "yyyy-MM-dd", new Date()),
            )
          : undefined,
      });
    const createdControllableUnitServiceProvider =
      await createControllableUnitServiceProvider({
        body: controllableUnitServiceProviderData,
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
          {!isServiceProvider && (
            <PartyReferenceInput
              {...fields.service_provider_id}
              resource="controllable_unit_service_provider"
              readOnly={isServiceProvider}
            />
          )}
          <div className="flex flex-row gap-3">
            <TextInput
              {...fields.contract_reference}
              resource="controllable_unit_service_provider"
            />
            {/* We want to ensure that the start date is not a future date so the user has access to change its values after creation. */}
            <DateInput {...fields.start_date} maxDate={new Date()} />
          </div>
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
        <FormToolbar />
      </FormContainer>
    </Form>
  );
};
