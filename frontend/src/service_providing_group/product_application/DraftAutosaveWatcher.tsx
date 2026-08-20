import { useGetOne } from "ra-core";
import { useFormContext } from "react-hook-form";
import { useEffect, useRef } from "react";
import { draftStorageKey } from "../../hooks/useSpgpaDrafts";

const AUTOSAVE_DELAY_MS = 1000;

// Inner component that sits inside <Form> so it can access useFormContext.
// Uses RHF's subscription API (watch callback) so that every field change
// triggers a save
export const DraftAutosaveWatcher = ({
  spgId,
  draftId,
}: {
  spgId: number | undefined;
  draftId: string;
}) => {
  const { watch } = useFormContext();

  // Watched as a snapshot to resolve the system operator name for display in the drafts list.
  const systemOperatorId = watch("procuring_system_operator_id");

  const { data: spg } = useGetOne(
    "service_providing_group",
    { id: spgId! },
    { enabled: !!spgId },
  );
  const { data: systemOperator } = useGetOne(
    "party",
    { id: systemOperatorId! },
    { enabled: !!systemOperatorId },
  );

  // Single ref for display metadata so the debounce callback always reads the
  // latest resolved names regardless of when the async fetches complete.
  const metaRef = useRef({
    spgName: undefined as string | undefined,
    systemOperatorName: undefined as string | undefined,
  });

  useEffect(() => {
    metaRef.current = {
      spgName: spg?.name,
      systemOperatorName: systemOperator?.name,
    };
  }, [spg?.name, systemOperator?.name]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!spgId) return;

    const { unsubscribe } = watch((values) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const entry = {
          savedAt: new Date().toISOString(),
          spgName: metaRef.current.spgName,
          systemOperatorName: metaRef.current.systemOperatorName,
          values: {
            service_providing_group_id: values.service_providing_group_id,
            procuring_system_operator_id: values.procuring_system_operator_id,
            product_type_ids: values.product_type_ids,
            maximum_active_power_up: values.maximum_active_power_up,
            maximum_active_power_down: values.maximum_active_power_down,
            ramping_capability: values.ramping_capability,
            ramping_description: values.ramping_description,
            additional_information: values.additional_information,
            prequalified_at: values.prequalified_at,
            verified_at: values.verified_at,
          },
        };
        localStorage.setItem(
          draftStorageKey(spgId, draftId),
          JSON.stringify(entry),
        );
      }, AUTOSAVE_DELAY_MS);
    });

    return () => {
      unsubscribe();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [watch, spgId, draftId]);

  return null;
};
