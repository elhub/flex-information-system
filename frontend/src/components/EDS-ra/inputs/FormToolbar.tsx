import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui";

type FormToolbarProps = {
  saveLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  saveAlwaysEnabled?: boolean;
  className?: string;
};

export const FormToolbar = ({
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saveAlwaysEnabled = false,
  onCancel,
  className,
}: FormToolbarProps) => {
  const navigate = useNavigate();
  const { formState } = useFormContext();

  const handleCancel = onCancel ?? (() => navigate(-1));

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
        {saveLabel}
      </Button>
      <Button
        variant="secondary"
        type="button"
        size="large"
        onClick={handleCancel}
      >
        {cancelLabel}
      </Button>
    </div>
  );
};
