import { useEffect, useState } from "react";
import { Form, ResourceContextProvider } from "ra-core";
import { useFormContext } from "react-hook-form";
import { AccountingPointGridLocation } from "../../generated-client";
import { zAccountingPointGridLocationCreateRequest } from "../../generated-client/zod.gen";
import { FormContainer } from "../../components/ui";
import {
  EnumInput,
  UnitInput,
  TextAreaInput,
  FormToolbar,
} from "../../components/EDS-ra";
import { getFields } from "../../zod";
import { Substation } from "../show/AccountingPointLocationMap";
import { SubstationReferenceInput } from "./SubstationReferenceInput";
import { useAccountingPointGridLocationFormController } from "./useAccountingPointGridLocationFormController";

const fields = getFields(zAccountingPointGridLocationCreateRequest.shape);

// RA-bridge leaf component: must live inside RA's <Form> tree to use
// useFormContext, so it can't be pulled fully into a hook (same precedent
// as DeleteButton/BiddingZoneField elsewhere).
const GridLocationFormFields = ({
  onDone,
  onCancel,
  selectedSubstation, // selected via the map
  onSelectSubstation,
  onClearMapSelection,
  existingGridLocation, // existing record (if editing)
}: {
  onDone: () => void;
  onCancel?: () => void;
  selectedSubstation?: Substation | null;
  onSelectSubstation?: (substation: Substation | null) => void;
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
    onSelectSubstation?.(substation);
    if (substation) {
      setValue("name", substation.name);
      const isNewSubstation = substation.business_id !== currentBusinessId;
      if (isNewSubstation) setValue("nominal_voltage", null);
      setComboboxVoltageLevels(substation.voltage_levels);
    } else {
      setValue("name", "");
      setValue("nominal_voltage", null);
      setComboboxVoltageLevels([]);
      onClearMapSelection?.();
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
      <FormToolbar onCancel={onCancel ?? onDone} saveAlwaysEnabled />
    </>
  );
};

// Presentational wiring: the mutation, record initialisation, and resolver
// live in useAccountingPointGridLocationFormController.
export const AccountingPointGridLocationInput = ({
  apId,
  gridLocation,
  onDone,
  onCancel,
  selectedSubstation,
  onSelectSubstation,
  onClearMapSelection,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  onDone: () => void;
  onCancel?: () => void;
  selectedSubstation?: Substation | null;
  onSelectSubstation?: (substation: Substation | null) => void;
  onClearMapSelection?: () => void;
}) => {
  const { record, resolver, onSubmit } =
    useAccountingPointGridLocationFormController({
      apId,
      gridLocation,
      selectedSubstation,
      onDone,
    });

  return (
    <ResourceContextProvider value="accounting_point_grid_location">
      {selectedSubstation && (
        <div className="mb-4 rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          Selected transformer: <strong>{selectedSubstation.name}</strong>
        </div>
      )}
      <Form record={record} resolver={resolver} onSubmit={onSubmit}>
        <FormContainer>
          <GridLocationFormFields
            onDone={onDone}
            onCancel={onCancel}
            selectedSubstation={selectedSubstation}
            onSelectSubstation={onSelectSubstation}
            onClearMapSelection={onClearMapSelection}
            existingGridLocation={gridLocation ?? null}
          />
        </FormContainer>
      </Form>
    </ResourceContextProvider>
  );
};
