import { Box, Typography } from "@mui/material";

export const LabelValue = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | undefined;
  unit?: string;
}) => {
  if (!value) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 1,
      }}
    >
      <Typography variant="subtitle1" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body1" fontWeight="400" color="text.primary">
        {value} {unit}
      </Typography>
    </Box>
  );
};
