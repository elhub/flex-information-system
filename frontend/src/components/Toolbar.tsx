import {
  Toolbar as RAToolbar,
  ToolbarProps as RAToolbarProps,
  SaveButton,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { Button, Box } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";

type ToolbarProps = {
  saveAlwaysEnabled?: boolean;
  saveLabel?: string;
  onSuccess?: (data: unknown) => void;
  onCancel?: () => void;
} & RAToolbarProps;

export const Toolbar = (props: ToolbarProps) => {
  const { saveAlwaysEnabled, saveLabel, onSuccess, onCancel, ...rest } = props;
  const navigate = useNavigate();

  const handleCancel = onCancel ? onCancel : () => navigate(-1);

  return (
    <RAToolbar {...rest}>
      <SaveButton
        type={onSuccess ? "button" : "submit"}
        alwaysEnable={saveAlwaysEnabled}
        label={saveLabel}
        mutationOptions={{ onSuccess }}
      />
      <Box width="1em" />
      <Button
        color="inherit"
        variant="contained"
        startIcon={<UndoIcon />}
        onClick={handleCancel}
      >
        Cancel
      </Button>
    </RAToolbar>
  );
};
