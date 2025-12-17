import { Box, Typography } from "@mui/material";
import { ControllableUnit } from "../../../generated-client";
import { useTranslateField } from "../../../intl/intl";

export const MetaInfo = ({
  controllableUnit,
}: {
  controllableUnit: ControllableUnit | undefined;
}) => {
  const translateField = useTranslateField();

  if (!controllableUnit?.recorded_at) {
    return null;
  }

  const formattedDate = new Date(controllableUnit?.recorded_at).toLocaleString(
    "no-NB",
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
      <Typography color="text.secondary">
        {translateField("controllable_unit.recorded_at")}: {formattedDate}
      </Typography>
    </Box>
  );
};
