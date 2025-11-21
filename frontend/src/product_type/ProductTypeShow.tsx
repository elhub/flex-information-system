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
          <TextField source="id" label="ID" />
          <TextField source="business_id" label="Business ID" />
          <TextField source="name" />
          <TextField source="service" />
          <TextField source="products" />
        </FieldStack>
      </Stack>
    </SimpleShowLayout>
  </Show>
);
export default ProductTypeShow;
