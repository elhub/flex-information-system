import { SimpleForm, TextInput, useRecordContext } from "react-admin";
import { Typography, Stack } from "@mui/material";
import { AutocompleteReferenceInput, InputStack } from "../../auth";
import { Toolbar } from "../../components/Toolbar";
import { zTechnicalResource } from "../../generated-client/zod.gen";
import { TechnicalResource } from "../../generated-client";
import useLocationState from "../../hooks/useLocationState";
import { zTechnicalResourceCreateRequest } from "../../generated-client/zod.gen";
import { unTypedZodResolver } from "../../util";

export type TechnicalResourceInputLocationState = {
  technicalResource?: Partial<TechnicalResource>;
};

// common layout to create and edit pages
export const TechnicalResourceInput = () => {
  const locationState = useLocationState<TechnicalResourceInputLocationState>();
  const technicalResourceOverride = locationState?.technicalResource
    ? zTechnicalResource.parse(locationState?.technicalResource)
    : {};

  const record = useRecordContext<TechnicalResource>();

  const overriddenRecord = {
    ...record,
    ...technicalResourceOverride,
  };

  return (
    <SimpleForm
      record={overriddenRecord}
      maxWidth={1280}
      resolver={unTypedZodResolver(zTechnicalResourceCreateRequest)}
      toolbar={<Toolbar />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source="name" label="field.technical_resource.name" />
          <AutocompleteReferenceInput
            source="controllable_unit_id"
            reference="controllable_unit"
            label="field.technical_resource.controllable_unit_id"
            readOnly
          />
          <TextInput
            source="details"
            label="field.technical_resource.details"
            multiline={true}
            minRows={3}
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};
