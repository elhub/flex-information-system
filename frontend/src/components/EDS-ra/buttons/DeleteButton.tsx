import React, { ReactNode } from "react";
import { Button } from "../../ui";
import { useDelete, useRecordContext, useResourceContext } from "ra-core";
import { IconCross } from "@elhub/ds-icons";
import { useConfirmAction } from "../../ConfirmAction";

type DeleteButtonProps = {
  label?: ReactNode;
  disabled?: boolean;
};

export const DeleteButton = (props: DeleteButtonProps) => {
  const { label, disabled } = props;
  const resource = useResourceContext();
  const record = useRecordContext();

  const [deleteMutation, { isPending }] = useDelete(
    resource,
    {
      id: record?.id,
    },
    {
      returnPromise: true,
    },
  );

  const { buttonProps, dialog } = useConfirmAction({
    title: "Delete",
    content:
      "Are you sure you want to delete this item? This action cannot be undone.",
    onConfirmMutation: {
      mutationFn: async () => deleteMutation(),
    },
  });

  if (!record || record.id == null) {
    return null;
  }

  return (
    <>
      <Button
        variant="caution"
        size="small"
        disabled={disabled || isPending}
        icon={IconCross}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          buttonProps.onClick();
        }}
      >
        {label}
      </Button>
      {dialog}
    </>
  );
};
