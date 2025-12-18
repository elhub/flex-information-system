import { Stack, Typography } from "@mui/material";
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
    <Stack direction="row" spacing={1}>
      <Typography color="text.secondary">
        {translateField("controllable_unit.recorded_at")}: {formattedDate}
      </Typography>
    </Stack>
  );
};
