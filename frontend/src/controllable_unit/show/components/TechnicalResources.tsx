import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  Button,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { TechnicalResource } from "../../../generated-client";
import AddIcon from "@mui/icons-material/Add";

export const TechnicalResources = ({
  technicalResources,
  controllableUnitId,
}: {
  controllableUnitId: number | undefined;
  technicalResources: TechnicalResource[] | undefined;
}) => {
  if (!controllableUnitId) {
    return null;
  }

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
          Technical resources:
        </Typography>
        <Button
          component={RouterLink}
          to={`/controllable_unit/${controllableUnitId}/technical_resource/create`}
          startIcon={<AddIcon />}
        >
          Add technical resource
        </Button>
      </Stack>
      {!!technicalResources?.length && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            flexWrap: "wrap",
            maxWidth: "1000px",
          }}
        >
          {technicalResources?.map((technicalResource) => (
            <Card key={technicalResource.id}>
              <CardActionArea
                component={RouterLink}
                to={`/controllable_unit/${technicalResource.controllable_unit_id}/technical_resource/${technicalResource.id}/show`}
              >
                <CardHeader
                  title={technicalResource.name}
                  subheader={technicalResource.id}
                />
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Details:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {technicalResource.details}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};
