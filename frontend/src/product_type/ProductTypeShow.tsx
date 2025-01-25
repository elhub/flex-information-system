import {
  FunctionField,
  Show,
  SimpleShowLayout,
  TextField,
  useTranslateLabel,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../auth";

export const ProductTypeShow = () => {
  const translateLabel = useTranslateLabel();

  return (
    <Show>
      <SimpleShowLayout>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6" gutterBottom>
            Basic information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="id" />
            <TextField source="business_id" label="Business ID" />
            <FunctionField
              source="business_id"
              label="Name"
              render={(record) =>
                translateLabel({ source: record.business_id })
              }
            />
            <TextField source="category" />
            <TextField source="market" />
            <TextField source="market_type" />
            <TextField source="examples" />
          </FieldStack>
          <Typography variant="h6" gutterBottom>
            Additional information
          </Typography>
          <FieldStack direction="row" flexWrap="wrap" spacing={2}>
            <TextField source="notes" />
          </FieldStack>
        </Stack>
      </SimpleShowLayout>
    </Show>
  );
};
