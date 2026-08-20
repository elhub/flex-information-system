import { ReactNode } from "react";
import { useSaveContext, useTranslate } from "ra-core";
import { FieldValues, SubmitHandler, useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useConfirmAction } from "../../ConfirmAction";
import { Button } from "../../ui";

type FormToolbarWithConfirmationProps = {
  confirmTitle: string;
  confirmContent: ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  saveAlwaysEnabled?: boolean;
  className?: string;
};

export const FormToolbarWithConfirmation = ({
  confirmTitle,
  confirmContent,
  saveLabel,
  cancelLabel,
  onCancel,
  onSuccess,
  saveAlwaysEnabled = false,
  className,
}: FormToolbarWithConfirmationProps) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { save } = useSaveContext();
  const { formState, handleSubmit } = useFormContext();

  const resolvedSaveLabel = saveLabel ?? translate("text.form_toolbar.save");
  const resolvedCancelLabel =
    cancelLabel ?? translate("text.form_toolbar.cancel");
  const handleCancel = onCancel ?? (() => navigate(-1));

  const isDisabled =
    !saveAlwaysEnabled && (formState.isSubmitting || !formState.isDirty);

  const { buttonProps, dialog } = useConfirmAction({
    title: confirmTitle,
    content: confirmContent,
    confirmText: resolvedSaveLabel,
    cancelText: resolvedCancelLabel,
    onConfirm: async () => {
      if (!save) return;
      await handleSubmit(async (values) => {
        await (save as SubmitHandler<FieldValues>)(values);
        onSuccess?.();
      })();
    },
  });

  return (
    <div className={`${className ?? ""} flex flex-row gap-3 mt-3 mb-3`}>
      <Button
        variant="primary"
        size="large"
        type="button"
        disabled={isDisabled}
        {...buttonProps}
      >
        {resolvedSaveLabel}
      </Button>
      <Button
        variant="secondary"
        type="button"
        size="large"
        onClick={handleCancel}
      >
        {resolvedCancelLabel}
      </Button>
      {dialog}
    </div>
  );
};
