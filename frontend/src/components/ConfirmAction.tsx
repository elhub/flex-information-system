import { ReactNode, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { useNotify } from "react-admin";

type UseConfirmActionOptions = {
  title: ReactNode;
  content?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  successMessage?: string;
  onConfirmMutation: MutationOptions;
};

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
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{title}</DialogTitle>
      {content ? <DialogContent>{content}</DialogContent> : null}
      <DialogActions>
        <Button disabled={isPending} onClick={() => setOpen(false)}>
          {cancelText}
        </Button>
        <Button disabled={isPending} onClick={confirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return {
    buttonProps: { onClick: () => setOpen(true) },
    dialog,
    isOpen: open,
    isPending,
  };
};
