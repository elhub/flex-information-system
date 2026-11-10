import { ReactNode, useState } from "react";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useNotify, useTranslate } from "ra-core";
import { Button, Modal } from "./ui";

type BaseOptions = {
  title: string;
  content?: ReactNode;
  confirmText?: string;
  confirmVariant?: "primary" | "caution";
  cancelText?: string;
  confirmDisabled?: boolean;
  secondaryAction?: { label: string; onClick: () => void };
};

type MutationOptions = BaseOptions & {
  onConfirmMutation: UseMutationOptions<unknown, Error, void>;
  onConfirm?: never;
  successMessage?: string;
};

type CallbackOptions = BaseOptions & {
  onConfirm: () => void;
  onConfirmMutation?: never;
  successMessage?: never;
};

type UseConfirmActionOptions = MutationOptions | CallbackOptions;

/*
This component is used to confirm an action with a dialog.

Pass either `onConfirmMutation` (a react-query mutation) or `onConfirm` (a plain
callback) depending on whether the confirmed action is async or not.
*/

export const useConfirmAction = ({
  title,
  content,
  confirmText,
  confirmVariant = "primary",
  cancelText,
  confirmDisabled = false,
  secondaryAction,
  ...rest
}: UseConfirmActionOptions) => {
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const translate = useTranslate();

  const { mutate, isPending } = useMutation(
    "onConfirmMutation" in rest && rest.onConfirmMutation
      ? rest.onConfirmMutation
      : { mutationFn: async () => {} },
  );

  const confirm = () => {
    if ("onConfirm" in rest && rest.onConfirm) {
      rest.onConfirm();
      setOpen(false);
      return;
    }
    mutate(undefined, {
      onSettled: () => {
        setOpen(false);
      },
      onSuccess: () => {
        if ("successMessage" in rest && rest.successMessage) {
          notify(rest.successMessage, { type: "success" });
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
    <Modal open={open} onClose={() => setOpen(false)} className="max-w-lg">
      <Modal.Header title={title} />
      {content ? <Modal.Content>{content}</Modal.Content> : null}
      <Modal.Footer>
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() => setOpen(false)}
        >
          {cancelText ?? translate("text.form_toolbar.cancel")}
        </Button>
        {secondaryAction ? (
          <Button
            variant="tertiary"
            disabled={isPending}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        ) : null}
        <Button
          variant={confirmVariant}
          disabled={isPending || confirmDisabled}
          onClick={confirm}
        >
          {confirmText ?? translate("text.form_toolbar.confirm")}
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
