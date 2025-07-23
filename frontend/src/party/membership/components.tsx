import { ArrayField, SelectArrayInput, WithListContext } from "react-admin";
import { Stack, Chip } from "@mui/material";

export const ScopesField = (props: any) => (
  <ArrayField {...props}>
    <WithListContext
      render={({ data }) => (
        <Stack direction="row" spacing={1}>
          {data?.map((scope) => (
            <Chip
              key={scope as any}
              sx={{ marginBottom: 1, borderRadius: 2 }}
              label={`${scope}`}
              variant="outlined"
              color="primary"
            />
          ))}
        </Stack>
      )}
    />
  </ArrayField>
);

export const ScopesInput = (props: any) => (
  <SelectArrayInput
    choices={[
      "data:read",
      "data:use",
      "data:manage",
      "auth:read",
      "auth:use",
      "auth:manage",
    ]}
    {...props}
  />
);
