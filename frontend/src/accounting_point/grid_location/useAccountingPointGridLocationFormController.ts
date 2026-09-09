import { useMemo } from "react";
import { useNotify } from "ra-core";
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
import { accountingPointViewModelQueryKey } from "../show/useAccountingPointViewModel";
import { unTypedZodResolver } from "../../zod";
import { Substation } from "../show/AccountingPointLocationMap";

// Controller/logic layer: owns RA (useNotify), the mutation
// (create/update), record initialisation, and the zod resolver. Returns
// plain data/functions only.
export const useAccountingPointGridLocationFormController = ({
  apId,
  gridLocation,
  selectedSubstation,
  onDone,
}: {
  apId: number;
  gridLocation: AccountingPointGridLocation | undefined;
  selectedSubstation?: Substation | null;
  onDone: () => void;
}) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const isCreate = gridLocation === undefined;

  // clearing selectedSubstation by picking via the combobox should not reset
  // the form fields (namely nominal voltage) so we compute the initial form
  // values once when the input component loads and then only explicit
  // manipulation of the form state can cause changes
  const record = useMemo(() => {
    const base: Partial<
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

    if (selectedSubstation) {
      return {
        ...base,
        name: selectedSubstation.name,
        object_type: "substation" as const,
        business_id: selectedSubstation.business_id,
        nominal_voltage: undefined,
      };
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const resolver = unTypedZodResolver(
    isCreate
      ? zAccountingPointGridLocationCreateRequest
      : zAccountingPointGridLocationUpdateRequest,
  );

  return { record, resolver, onSubmit };
};
