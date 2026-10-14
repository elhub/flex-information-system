import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui";
import { useTranslate } from "ra-core";

type FormToolbarProps = {
  saveLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  saveAlwaysEnabled?: boolean;
  className?: string;
};

export const FormToolbar = ({
  saveLabel,
  cancelLabel,
  saveAlwaysEnabled = false,
  onCancel,
  className,
}: FormToolbarProps) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { formState } = useFormContext();

  const handleCancel = onCancel ?? (() => navigate(-1));

  const resolvedSaveLabel = saveLabel ?? translate("text.form_toolbar.save");
  const resolvedCancelLabel =
    cancelLabel ?? translate("text.form_toolbar.cancel");

  const isDisabled =
    !saveAlwaysEnabled && (formState.isSubmitting || !formState.isDirty);

  return (
    <div className={`${className ?? ""} flex flex-row gap-3 mt-3 mb-3`}>
      <Button
        variant="primary"
        size="large"
        type="submit"
        disabled={isDisabled}
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
    </div>
  );
};
