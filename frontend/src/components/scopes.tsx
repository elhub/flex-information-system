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
              label={`${scope}`}
              size="small"
              sx={{
                borderRadius: 2,
                fontWeight: 500,
              }}
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
      "read:data",
      "use:data",
      "use:data:entity:lookup",
      "manage:data",
      "manage:data:party_membership",
      "manage:data:entity_client",
      "read:auth",
      "use:auth",
      "manage:auth",
    ]}
    defaultValue={["manage:data", "manage:auth"]}
    {...props}
  />
);
