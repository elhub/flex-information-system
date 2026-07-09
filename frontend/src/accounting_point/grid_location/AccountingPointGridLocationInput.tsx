import { useEffect, useState } from "react";
import { Form, ResourceContextProvider, useNotify } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import z from "zod";
import {
  AccountingPointGridLocation,
  createAccountingPointGridLocation,
  updateAccountingPointGridLocation,
} from "../../generated-client";
import {
  zAccountingPointGridLocationCreateRequest,
  zAccountingPointGridLocationUpdateRequest,
} from "../../generated-client/zod.gen";
import { FormContainer } from "../../components/ui";
import {
  EnumInput,
  UnitInput,
  TextAreaInput,
  FormToolbar,
} from "../../components/EDS-ra";
import { accountingPointViewModelQueryKey } from "../show/useAccountingPointViewModel";
import { unTypedZodResolver, getFields } from "../../zod";
import { Substation } from "../show/AccountingPointLocationMap";
import { SubstationReferenceInput } from "./SubstationReferenceInput";

const fields = getFields(zAccountingPointGridLocationCreateRequest.shape);

const GridLocationFormFields = ({
  onDone,
  selectedSubstation, // selected via the map
  onClearMapSelection,
  existingGridLocation, // existing record (if editing)
}: {
  onDone: () => void;
  selectedSubstation?: Substation | null;
  onClearMapSelection?: () => void;
  existingGridLocation?: { name: string; business_id: string } | null;
}) => {
  const { setValue, watch } = useFormContext();
  const currentBusinessId = watch("business_id");

  // track voltage levels selected via the combobox
  const [comboboxVoltageLevels, setComboboxVoltageLevels] = useState<number[]>(
    [],
  );

  const selectedVoltageLevels =
    selectedSubstation?.voltage_levels ?? comboboxVoltageLevels;

  const handleSubstationSelect = (substation: Substation | null) => {
    if (substation) {
      setValue("name", substation.name);
      const isNewSubstation = substation.business_id !== currentBusinessId;
      if (isNewSubstation) setValue("nominal_voltage", null);
      setComboboxVoltageLevels(substation.voltage_levels);
      // the user picked via the combobox, so the map selection is stale
      onClearMapSelection?.();
    } else {
      setValue("name", "");
      setValue("nominal_voltage", null);
      setComboboxVoltageLevels([]);
    }
  };

  // when the map-selected substation changes, sync the form fields
  useEffect(() => {
    if (selectedSubstation) {
      setValue("business_id", selectedSubstation.business_id);
      setValue("name", selectedSubstation.name);
      setValue("object_type", "substation");
      const isNewSubstation =
        selectedSubstation.business_id !== currentBusinessId;
      if (isNewSubstation) setValue("nominal_voltage", null);
    }
  }, [selectedSubstation, currentBusinessId, setValue]);

  const nominalVoltage = watch("nominal_voltage");

  return (
    <>
      <SubstationReferenceInput
        source="business_id"
        required={fields.business_id.required}
        tooltip={false}
        onSelect={handleSubstationSelect}
        knownSubstation={selectedSubstation ?? existingGridLocation}
      />
      {/* show possible voltage levels when no meaningful voltage is set yet */}
      {selectedVoltageLevels.length > 0 && !nominalVoltage && (
        <p className="text-xs text-gray-500 -mt-2">
          Substation voltage levels:{" "}
          {selectedVoltageLevels.map((v) => `${v} kV`).join(", ")}
        </p>
      )}
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
        warning="Please remember not to write any sensitive (power/market/personal) information in this field."
      />
      <FormToolbar onCancel={onDone} saveAlwaysEnabled />
    </>
  );
};

export const AccountingPointGridLocationInput = ({
  apId,
  gridLocation,
  onDone,
  selectedSubstation,
  onClearMapSelection,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  onDone: () => void;
  selectedSubstation?: Substation | null;
  onClearMapSelection?: () => void;
}) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const isCreate = gridLocation === undefined;

  // initial form values + override with selected substation if present
  const baseRecord: Partial<
    z.infer<typeof zAccountingPointGridLocationCreateRequest>
  > = isCreate
    ? {
        accounting_point_id: apId,
        object_type: "substation",
        quality: "guessed",
      }
    : {
        accounting_point_id: apId,
        name: gridLocation.name,
        object_type: gridLocation.object_type,
        business_id: gridLocation.business_id ?? undefined,
        nominal_voltage: gridLocation.nominal_voltage,
        quality: gridLocation.quality,
        additional_information: gridLocation.additional_information ?? "",
      };

  const record = selectedSubstation
    ? {
        ...baseRecord,
        name: selectedSubstation.name,
        object_type: "substation" as const,
        business_id: selectedSubstation.business_id,
        nominal_voltage: undefined,
      }
    : baseRecord;

  const onSubmit = async (values: object) => {
    if (isCreate) {
      const body = zAccountingPointGridLocationCreateRequest.parse(values);
      const result = await createAccountingPointGridLocation({ body });
      if (result.error) {
        notify(result.error.message ?? "An error occurred", { type: "error" });
        return;
      }
    } else {
      const body = zAccountingPointGridLocationUpdateRequest.parse(values);
      const result = await updateAccountingPointGridLocation({
        path: { id: gridLocation.id },
        body,
      });
      if (result.error) {
        notify(result.error.message ?? "An error occurred", { type: "error" });
        return;
      }
    }
    await queryClient.invalidateQueries({
      queryKey: accountingPointViewModelQueryKey(apId),
    });
    onDone();
  };

  return (
    <ResourceContextProvider value="accounting_point_grid_location">
      {selectedSubstation && (
        <div className="mb-4 rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          Selected transformer from map:{" "}
          <strong>{selectedSubstation.name}</strong>
        </div>
      )}
      <Form
        record={record}
        resolver={unTypedZodResolver(
          isCreate
            ? zAccountingPointGridLocationCreateRequest
            : zAccountingPointGridLocationUpdateRequest,
        )}
        onSubmit={onSubmit}
      >
        <FormContainer>
          <GridLocationFormFields
            onDone={onDone}
            selectedSubstation={selectedSubstation}
            onClearMapSelection={onClearMapSelection}
            existingGridLocation={gridLocation ?? null}
          />
        </FormContainer>
      </Form>
    </ResourceContextProvider>
  );
};
