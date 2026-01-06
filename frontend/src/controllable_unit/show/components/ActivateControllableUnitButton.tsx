import { Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ControllableUnitShowViewModel } from "../useControllableUnitViewModel";
import { controllableUnitViewModelQueryKey } from "../useControllableUnitViewModel";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { updateControllableUnit } from "../../../generated-client";

export const ActivateControllableUnitButton = ({
  controllableUnitId,
  disabled,
}: {
  controllableUnitId: number;
  disabled: boolean;
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
        }),
      onSuccess: () => {
        queryClient.setQueryData(
          controllableUnitViewModelQueryKey(controllableUnitId),
          (old: ControllableUnitShowViewModel | undefined) =>
            old
              ? {
                  ...old,
                  controllableUnit: {
                    ...old.controllableUnit,
                    status: "active",
                  },
                }
              : old,
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "controllable_unit",
            "getOne",
            { id: String(controllableUnitId) },
          ],
        });
        queryClient.invalidateQueries({
          queryKey: controllableUnitViewModelQueryKey(controllableUnitId),
        });
      },
    },
  });

  return (
    <>
      <Button disabled={disabled} {...buttonProps}>
        Activate
      </Button>
      {dialog}
    </>
  );
};
