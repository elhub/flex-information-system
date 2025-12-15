import { Show, SimpleShowLayout, TextField } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack } from "../auth";

export const ProductTypeShow = () => (
  <Show>
    <SimpleShowLayout>
      <Stack direction="column" spacing={2}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <FieldStack direction="row" flexWrap="wrap" spacing={2}>
          <TextField source="id" label="field.product_type.id" />
          <TextField
            source="business_id"
            label="field.product_type.business_id"
          />
          <TextField source="name" label="field.product_type.name" />
          <TextField source="service" label="field.product_type.service" />
          <TextField source="products" label="field.product_type.products" />
        </FieldStack>
      </Stack>
    </SimpleShowLayout>
  </Show>
);
