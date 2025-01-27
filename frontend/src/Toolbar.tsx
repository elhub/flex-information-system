import { Toolbar as RAToolbar, SaveButton } from "react-admin";
import { useNavigate } from "react-router-dom";
import { Button, Box } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";

export const Toolbar = (props: any) => {
  const { saveAlwaysEnabled, saveLabel, ...rest } = props;
  const navigate = useNavigate();

  return (
    <RAToolbar {...rest}>
      <SaveButton alwaysEnable={saveAlwaysEnabled} label={saveLabel} />
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
