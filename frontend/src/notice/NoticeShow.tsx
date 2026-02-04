import { SimpleShowLayout, TextField, Show, ReferenceField } from "react-admin";
import { Stack, Typography } from "@mui/material";
import { FieldStack } from "../auth";
import { DateField } from "../components/datetime";
import { EnumField } from "../components/enum";
import { NoticeShowDetails } from "./NoticeShowDetails";

export const NoticeShow = () => (
  <Show>
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <TextField source="id" label="field.notice.id" />
          <ReferenceField
            source="party_id"
            reference="party"
            sortable={false}
            label="field.notice.party_id"
          >
            <TextField source="name" />
          </ReferenceField>
          <TextField source="type" label="field.notice.type" />
          <TextField source="source" label="field.notice.source" />
          <EnumField
            source="status"
            enumKey="notice.status"
            label="field.notice.status"
          />
          <DateField
            source="recorded_at"
            showTime
            label="field.notice.recorded_at"
          />
        </FieldStack>
        <Typography variant="h6" gutterBottom>
          Details
        </Typography>
        <NoticeShowDetails />
      </Stack>
    </SimpleShowLayout>
  </Show>
);
