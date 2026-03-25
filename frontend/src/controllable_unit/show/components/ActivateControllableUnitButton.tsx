import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { updateControllableUnit } from "../../../generated-client";
<<<<<<< HEAD
import { throwOnError } from "../../../util";
||||||| parent of 7e1ce025 (feat: align CU show page with SPG show page pattern (FLEX-1107))
=======
import { Button } from "../../../components/ui";
>>>>>>> 7e1ce025 (feat: align CU show page with SPG show page pattern (FLEX-1107))

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
        }).then(throwOnError),
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["controllable_unit", controllableUnitId],
        });
      },
    },
  });

  return (
    <>
      <Button variant="invisible" disabled={disabled} {...buttonProps}>
        Activate
      </Button>
      {dialog}
    </>
  );
};
