import { useQueryClient } from "@tanstack/react-query";
import { useConfirmAction } from "../../../components/ConfirmAction";
import { updateControllableUnit } from "../../../generated-client";
import { Button, BodyText } from "../../../components/ui";
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
    content: (
      <div>
        <BodyText>
          Activating the controllable unit will allow you to add it to service
          providing groups.
        </BodyText>
        <BodyText class="mt-2">
          Ensure the following before activating:
        </BodyText>
        <ul className="list-disc pl-5 mt-2">
          <li>all technical resources have been added</li>
          <li>data is correct</li>
        </ul>
      </div>
    ),
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
