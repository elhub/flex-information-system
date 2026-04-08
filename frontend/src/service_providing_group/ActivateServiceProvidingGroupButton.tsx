import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../components/ConfirmAction";
import { updateServiceProvidingGroup } from "../generated-client";
import { Button } from "../components/ui";

export const ActivateServiceProvidingGroupButton = ({
  spgId,
  disabled,
}: {
  spgId: number;
  disabled: boolean;
}) => {
  const queryClient = useQueryClient();

  const { buttonProps, dialog } = useConfirmAction({
    title: "Activate service providing group",
    content:
      "Activating the controllable unit will notify the system operator to validate the controllable unit.",
    confirmText: "Activate",
    onConfirmMutation: {
      mutationFn: () =>
        updateServiceProvidingGroup({
          path: { id: spgId },
          body: { status: "active" },
        }),
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "service_providing_group",
            "getOne",
            { id: String(spgId) },
          ],
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
