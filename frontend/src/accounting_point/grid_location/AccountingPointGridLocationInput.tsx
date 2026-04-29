import { Form, ResourceContextProvider } from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import z from "zod";
import {
  AccountingPointGridLocation,
  createAccountingPointGridLocation,
  updateAccountingPointGridLocation,
} from "../../generated-client";
import {
  zAccountingPointGridLocationCreateRequestWritable,
  zAccountingPointGridLocationUpdateRequestWritable,
} from "../../generated-client/zod.gen";
import { FormContainer } from "../../components/ui";
import {
  TextInput,
  EnumInput,
  UnitInput,
  TextAreaInput,
  FormToolbar,
} from "../../components/EDS-ra";
import { accountingPointViewModelQueryKey } from "../show/useAccountingPointViewModel";
import { throwOnError } from "../../util";
import { unTypedZodResolver, getFields } from "../../zod";

const fields = getFields(
  zAccountingPointGridLocationCreateRequestWritable.shape,
);

export const AccountingPointGridLocationInput = ({
  apId,
  gridLocation,
  onDone,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  onDone: () => void;
}) => {
  const queryClient = useQueryClient();
  const isCreate = gridLocation === undefined;

  const record: Partial<
    z.infer<typeof zAccountingPointGridLocationCreateRequestWritable>
  > = isCreate
    ? { accounting_point_id: apId }
    : {
        name: gridLocation.name,
        object_type: gridLocation.object_type,
        business_id: gridLocation.business_id ?? undefined,
        nominal_voltage: gridLocation.nominal_voltage,
        quality: gridLocation.quality,
        additional_information: gridLocation.additional_information ?? "",
      };

  const onSubmit = async (values: object) => {
    if (isCreate) {
      const body =
        zAccountingPointGridLocationCreateRequestWritable.parse(values);
      await createAccountingPointGridLocation({ body }).then(throwOnError);
    } else {
      const body =
        zAccountingPointGridLocationUpdateRequestWritable.parse(values);
      await updateAccountingPointGridLocation({
        path: { id: gridLocation.id },
        body,
      }).then(throwOnError);
    }
    await queryClient.invalidateQueries({
      queryKey: accountingPointViewModelQueryKey(apId),
    });
    onDone();
  };

  return (
    <ResourceContextProvider value="accounting_point_grid_location">
      <Form
        record={record}
        resolver={unTypedZodResolver(
          isCreate
            ? zAccountingPointGridLocationCreateRequestWritable
            : zAccountingPointGridLocationUpdateRequestWritable,
        )}
        onSubmit={onSubmit}
      >
        <FormContainer>
          <TextInput {...fields.name} tooltip={false} />
          <EnumInput
            {...fields.object_type}
            enumKey="accounting_point_grid_location.object_type"
            tooltip={false}
          />
          <TextInput {...fields.business_id} tooltip={false} />
          <UnitInput
            {...fields.nominal_voltage}
            units={[{ label: "kV", scale: 1 }]}
            tooltip={false}
          />
          <EnumInput
            {...fields.quality}
            enumKey="accounting_point_grid_location.quality"
            tooltip={false}
          />
          <TextAreaInput
            {...fields.additional_information}
            tooltip={false}
            rows={5}
          />
          <FormToolbar onCancel={onDone} />
        </FormContainer>
      </Form>
    </ResourceContextProvider>
  );
};
