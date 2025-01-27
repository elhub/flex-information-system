import { Chip } from "@mui/material";

export const QuickFilter = ({
  label,
}: {
  label: string;
  source?: string;
  defaultValue?: any;
}) => {
  return <Chip sx={{ marginBottom: 1 }} label={label} />;
};
