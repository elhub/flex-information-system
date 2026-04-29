import { useForm, Controller, FieldValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslate } from "ra-core";
import {
  AccountingPointGridLocation,
  AccountingPointGridLocationCreateRequestWritable,
  AccountingPointGridLocationUpdateRequestWritable,
  createAccountingPointGridLocation,
  updateAccountingPointGridLocation,
} from "../../generated-client";
import {
  zAccountingPointGridLocationCreateRequestWritable,
  zAccountingPointGridLocationUpdateRequestWritable,
} from "../../generated-client/zod.gen";
import {
  Button,
  FormItem,
  FormItemLabel,
  Select,
  SelectContent,
  SelectItem,
  TextField,
  Textarea,
} from "../../components/ui";
import { accountingPointViewModelQueryKey } from "./useAccountingPointViewModel";
import { throwOnError } from "../../util";

const OBJECT_TYPE_OPTIONS = ["substation", "transformer"] as const;
const QUALITY_OPTIONS = ["confirmed", "guessed"] as const;

type CreateFormValues = AccountingPointGridLocationCreateRequestWritable;
type UpdateFormValues = AccountingPointGridLocationUpdateRequestWritable;

export const AccountingPointGridLocationForm = ({
  apId,
  gridLocation,
  onDone,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  onDone: () => void;
}) => {
  const translate = useTranslate();
  const queryClient = useQueryClient();
  const isCreate = gridLocation === undefined;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    resolver: (isCreate
      ? zodResolver(zAccountingPointGridLocationCreateRequestWritable)
      : zodResolver(
          zAccountingPointGridLocationUpdateRequestWritable,
        )) as Resolver,
    defaultValues: isCreate
      ? { accounting_point_id: apId }
      : {
          name: gridLocation.name,
          object_type: gridLocation.object_type,
          business_id: gridLocation.business_id ?? undefined,
          nominal_voltage: gridLocation.nominal_voltage,
          quality: gridLocation.quality,
          additional_information: gridLocation.additional_information ?? "",
        },
  });

  const onSubmit = async (values: CreateFormValues | UpdateFormValues) => {
    if (isCreate) {
      await createAccountingPointGridLocation({
        body: { ...values } as CreateFormValues,
      }).then(throwOnError);
    } else {
      await updateAccountingPointGridLocation({
        path: { id: gridLocation.id },
        body: { ...values } as UpdateFormValues,
      }).then(throwOnError);
    }
    await queryClient.invalidateQueries({
      queryKey: accountingPointViewModelQueryKey(apId),
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <FormItem
            error={errors.name?.message as string | undefined}
            size="large"
            inputProps={{ required: isCreate }}
          >
            <FormItemLabel size="large">
              {translate("field.accounting_point_grid_location.name")}
            </FormItemLabel>
            <TextField {...field} value={field.value ?? ""} />
          </FormItem>
        )}
      />

      <Controller
        name="object_type"
        control={control}
        render={({ field }) => (
          <FormItem
            error={errors.object_type?.message as string | undefined}
            size="large"
            inputProps={{ required: isCreate }}
          >
            <FormItemLabel size="large">
              {translate("field.accounting_point_grid_location.object_type")}
            </FormItemLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              placeholder="Select..."
            >
              <SelectContent>
                {OBJECT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {translate(
                      `enum.accounting_point_grid_location.object_type.${option}`,
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <Controller
        name="business_id"
        control={control}
        render={({ field }) => (
          <FormItem
            error={errors.business_id?.message as string | undefined}
            size="large"
          >
            <FormItemLabel size="large">
              {translate("field.accounting_point_grid_location.business_id")}
            </FormItemLabel>
            <TextField
              {...field}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? undefined : e.target.value,
                )
              }
            />
          </FormItem>
        )}
      />

      <Controller
        name="nominal_voltage"
        control={control}
        render={({ field }) => (
          <FormItem
            error={errors.nominal_voltage?.message as string | undefined}
            size="large"
            inputProps={{ required: isCreate }}
          >
            <FormItemLabel size="large">
              {translate(
                "field.accounting_point_grid_location.nominal_voltage",
              )}
            </FormItemLabel>
            <TextField
              {...field}
              value={field.value != null ? String(field.value) : ""}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              type="number"
              unit="kV"
            />
          </FormItem>
        )}
      />

      <Controller
        name="quality"
        control={control}
        render={({ field }) => (
          <FormItem
            error={errors.quality?.message as string | undefined}
            size="large"
            inputProps={{ required: isCreate }}
          >
            <FormItemLabel size="large">
              {translate("field.accounting_point_grid_location.quality")}
            </FormItemLabel>
            <Select
              value={field.value ?? ""}
              onValueChange={field.onChange}
              placeholder="Select..."
            >
              <SelectContent>
                {QUALITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {translate(
                      `enum.accounting_point_grid_location.quality.${option}`,
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <Controller
        name="additional_information"
        control={control}
        render={({ field }) => (
          <FormItem
            error={errors.additional_information?.message as string | undefined}
            size="large"
          >
            <FormItemLabel size="large">
              {translate(
                "field.accounting_point_grid_location.additional_information",
              )}
            </FormItemLabel>
            <Textarea {...field} value={field.value ?? ""} rows={5} />
          </FormItem>
        )}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
