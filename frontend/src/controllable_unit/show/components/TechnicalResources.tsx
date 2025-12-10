import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { TechnicalResource } from "../../../generated-client";

export const TechnicalResources = ({
  technicalResources,
}: {
  technicalResources: TechnicalResource[] | undefined;
}) => {
  if (!technicalResources?.length) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
        Technical resources:
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          flexWrap: "wrap",
          maxWidth: "1000px",
        }}
      >
        {technicalResources.map((technicalResource) => (
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
    </Box>
  );
};
