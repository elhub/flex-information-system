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
import { useI18nProvider } from "../../../intl/intl";
import { usePermissions } from "react-admin";
import { Permissions } from "../../../auth/permissions";

export const TechnicalResources = ({
  technicalResources,
  controllableUnitId,
}: {
  controllableUnitId: number | undefined;
  technicalResources: TechnicalResource[] | undefined;
}) => {
  const { translate } = useI18nProvider();
  const { permissions } = usePermissions<Permissions>();
  const canCreateTechnicalResource = permissions?.allow(
    "technical_resource",
    "create",
  );

  if (!controllableUnitId) {
    return null;
  }
  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }} gutterBottom>
          Technical resources:
        </Typography>
        {canCreateTechnicalResource && (
          <Button
            component={RouterLink}
            to={`/controllable_unit/${controllableUnitId}/technical_resource/create`}
            startIcon={<AddIcon />}
          >
            Add technical resource
          </Button>
        )}
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
                    {translate("technical_resource.details")}
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
