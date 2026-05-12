import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { updateControllableUnit } from "../../../generated-client";
import { Button } from "../../../components/ui";
import { throwOnError } from "../../../util";
import { controllableUnitViewModelQueryKey } from "../useControllableUnitViewModel";

export const ActivateControllableUnitButton = ({
  controllableUnitId,
  disabled,
}: {
  controllableUnitId: number;
  disabled?: boolean;
}) => {
  const queryClient = useQueryClient();

  const { buttonProps, dialog } = useConfirmAction({
    title: "Activate controllable unit",
    content:
      "Activating the controllable unit will notify the system operator to validate the controllable unit.",
    confirmText: "Activate",
    onConfirmMutation: {
      mutationFn: () =>
        updateControllableUnit({
          path: { id: controllableUnitId },
          body: { status: "active" },
        }).then(throwOnError),
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["controllable_unit", controllableUnitId],
        });
        queryClient.invalidateQueries({
          queryKey: controllableUnitViewModelQueryKey(controllableUnitId),
        });
      },
    },
  });

  return (
    <>
      <Button
        variant="primary"
        size="small"
        disabled={disabled}
        {...buttonProps}
      >
        Activate
      </Button>
      {dialog}
    </>
  );
};
