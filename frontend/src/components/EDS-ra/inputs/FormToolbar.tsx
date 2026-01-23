import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, FlexDiv } from "../../ui";

type FormToolbarProps = {
  saveLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  saveAlwaysEnabled?: boolean;
};

export const FormToolbar = ({
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saveAlwaysEnabled = false,
  onCancel,
}: FormToolbarProps) => {
  const navigate = useNavigate();
  const { formState } = useFormContext();

  const handleCancel = onCancel ?? (() => navigate(-1));

  const isDisabled =
    !saveAlwaysEnabled && (formState.isSubmitting || !formState.isDirty);

  return (
    <FlexDiv
      style={{
        gap: "var(--eds-size-3)",
        marginTop: "var(--eds-size-3)",
        marginBottom: "var(--eds-size-3)",
      }}
    >
      <Button
        variant="primary"
        size="large"
        type="submit"
        disabled={isDisabled}
      >
        {saveLabel}
      </Button>
      <Button variant="secondary" size="large" onClick={handleCancel}>
        {cancelLabel}
      </Button>
    </FlexDiv>
  );
};
