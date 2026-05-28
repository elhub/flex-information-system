import { useQueryClient } from "@tanstack/react-query";
import { useTranslate } from "ra-core";
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
  const translate = useTranslate();

  const { buttonProps, dialog } = useConfirmAction({
    title: translate("text.spg_activate_group_title"),
    content: (
      <div>
        <BodyText>{translate("text.spg_activate_group_notice")}</BodyText>
        <BodyText className="mt-2">
          {translate("text.spg_activate_group_ensure")}
        </BodyText>
        <ul className="list-disc pl-5 mt-2">
          <li>{translate("text.spg_activate_group_ensure_pt1")}</li>
          <li>{translate("text.spg_activate_group_ensure_pt2")}</li>
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
