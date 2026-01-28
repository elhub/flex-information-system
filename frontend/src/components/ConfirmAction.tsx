import { ReactNode, useState } from "react";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useNotify } from "react-admin";
import { Button, Modal } from "./ui";

type UseConfirmActionOptions = {
  title: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  successMessage?: string;
  onConfirmMutation: UseMutationOptions<unknown, Error, void>;
};

/*
This component is used to confirm an action with a dialog.

The mutation is passed as an option and will be executed when the user confirms the action.

*/

export const useConfirmAction = ({
  title,
  content,
  confirmText = "Confirm",
  cancelText = "Cancel",
  successMessage,
  onConfirmMutation,
}: UseConfirmActionOptions) => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useMutation(onConfirmMutation);
  const notify = useNotify();

  const confirm = () => {
    mutate(undefined, {
      onSettled: () => {
        setOpen(false);
      },
      onSuccess: () => {
        if (successMessage) {
          notify(successMessage, { type: "success" });
        }
      },
      onError: (error) => {
        notify(error instanceof Error ? error.message : "An error occurred", {
          type: "error",
        });
      },
    });
  };

  const dialog = (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Modal.Header title={title} />
      {content ? <Modal.Content>{content}</Modal.Content> : null}
      <Modal.Footer>
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() => setOpen(false)}
        >
          {cancelText}
        </Button>
        <Button disabled={isPending} onClick={confirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return {
    buttonProps: {
      onClick: () => {
        setOpen(true);
      },
    },
    dialog,
    isOpen: open,
    isPending,
  };
};
