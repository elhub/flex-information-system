import {
  Button,
  RichTextField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useResourceContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../auth";
import EditIcon from "@mui/icons-material/Edit";
import { Link, useLocation } from "react-router-dom";
import { IdentityField } from "./IdentityField";
import { EventButton } from "../event/EventButton";
import { NestedResourceHistoryButton } from "./history";
import { DateField } from "./datetime";
import { capitaliseFirstLetter, removeSuffix } from "../util";

const EditButton = (props: { url: string }) => (
  <Button
    component={Link}
    to={removeSuffix("/show", props.url)}
    startIcon={<EditIcon />}
    label="Edit"
  />
);

export const CommentShow = () => {
  const resource = useResourceContext()!;
  const { permissions } = usePermissions();
  const location = useLocation();

  const isHistory = resource.endsWith("_history");

  const baseResource = removeSuffix(
    "_comment",
    removeSuffix("_history", resource),
  );
  const baseResourceHumanName = capitaliseFirstLetter(
    baseResource.replaceAll("_", " "),
  );

  return (
    <Show
      actions={
        !isHistory &&
        permissions.includes(`${baseResource}_comment.update`) && (
          <TopToolbar>
            <EditButton url={location.pathname} />
          </TopToolbar>
        )
      }
    >
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" label="ID" />
            <TextField
              source={`${baseResource}_id`}
              label={`${baseResourceHumanName} ID`}
            />
            <IdentityField source="created_by" />
            <TextField source="visibility" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Content
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <RichTextField source="content" />
          </FieldStack>

          <Typography variant="h6" gutterBottom>
            Registration
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <DateField source="created_at" showTime />
            <DateField source="recorded_at" label="Last updated" showTime />
            <IdentityField source="recorded_by" />
          </FieldStack>
        </Stack>
        {!isHistory && <EventButton />}
        <NestedResourceHistoryButton child="comment" label="comments" />
      </SimpleShowLayout>
    </Show>
  );
};
