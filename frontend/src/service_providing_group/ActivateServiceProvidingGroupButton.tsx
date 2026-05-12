import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../components/ConfirmAction";
import { updateServiceProvidingGroup } from "../generated-client";
import { Button } from "../components/ui";
import { throwOnError } from "../util";

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
      "Activating the service providing group will notify the system operator to validate the service providing group.",
    confirmText: "Activate",
    onConfirmMutation: {
      mutationFn: () =>
        updateServiceProvidingGroup({
          path: { id: spgId },
          body: { status: "active" },
        }).then(throwOnError),
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["service_providing_group", spgId],
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
