import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../components/ConfirmAction";
import { updateServiceProvidingGroup } from "../generated-client";
import { Button, BodyText } from "../components/ui";
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
    content: (
      <div>
        <BodyText>
          Activating the service providing group will allow you to use it in a
          product application.
        </BodyText>
        <BodyText className="mt-2">
          Ensure the following before activating:
        </BodyText>
        <ul className="list-disc pl-5 mt-2">
          <li>all controllable units have been added</li>
          <li>data is correct</li>
        </ul>
      </div>
    ),
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
