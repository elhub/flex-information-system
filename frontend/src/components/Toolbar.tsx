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
} & RAToolbarProps;

export const Toolbar = (props: ToolbarProps) => {
  const { saveAlwaysEnabled, saveLabel, onSuccess, ...rest } = props;
  const navigate = useNavigate();

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
        onClick={() => navigate(-1)}
      >
        Cancel
      </Button>
    </RAToolbar>
  );
};
