import {
  Button,
  RichTextField,
  List,
  Show,
  ResourceContextProvider,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  usePermissions,
  useResourceContext,
  required,
  SelectInput,
  NumberInput,
  SimpleForm,
  TextInput,
  useRecordContext,
} from "react-admin";
import { Typography, Stack } from "@mui/material";
import { FieldStack, InputStack, Datagrid } from "../auth";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Link, useLocation } from "react-router-dom";
import { IdentityField } from "./IdentityField";
import { EventButton } from "../event/EventButton";
import { NestedResourceHistoryButton } from "./history";
import { DateField } from "./datetime";
import { capitaliseFirstLetter, chunksOf, removeSuffix } from "../util";
import { Toolbar } from "./Toolbar";
import { RichTextInput } from "ra-input-rich-text";

const EditButton = (props: { url: string }) => (
  <Button
    component={Link}
    to={removeSuffix("/show", props.url)}
    startIcon={<EditIcon />}
    label="Edit"
  />
);

const CreateButton = ({
  parentPath,
  baseIDInformation,
}: {
  parentPath: string;
  baseIDInformation: any;
}) => (
  <Button
    component={Link}
    to={`${parentPath}/comment/create`}
    startIcon={<AddIcon />}
    state={baseIDInformation}
    label="Create"
  />
);

const ListActions = ({
  permissions,
  baseResource,
  parentPathS,
  baseIDInformation,
}: {
  permissions: string[];
  baseResource: string;
  parentPathS: string;
  baseIDInformation: any;
}) => (
  <TopToolbar>
    {permissions.includes(`${baseResource}_comment.create`) && (
      <CreateButton
        parentPath={parentPathS}
        baseIDInformation={baseIDInformation}
      />
    )}
  </TopToolbar>
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

export type CommentListProps = {
  // API resource where comments are attached
  // (override if not to be derived from URL)
  baseResource?: string;
};

export const CommentList = (props: CommentListProps) => {
  const { permissions } = usePermissions();
  const location = useLocation();

  const resource = useResourceContext()!;
  const baseResource = props.baseResource ?? resource;

  // TODO: just throw the first '/' and extract the last ID, no need to chunk
  const parentPath = chunksOf(
    2,
    removeSuffix("/show", location.pathname).split("/").slice(1),
  ).map(([resource, id]) => ({
    resource,
    id: Number(id),
  }));

  // ID of the row in the base resource we are listing comments for
  const baseID = parentPath.at(-1)!.id;
  const baseIDInformation: Record<string, number> = {};
  baseIDInformation[`${baseResource}_id`] = baseID;

  // reconstruct as string to make the link later
  const parentPathS = parentPath.map((p) => `/${p.resource}/${p.id}`).join("");

  return (
    permissions.includes(`${baseResource}_comment.read`) && (
      <ResourceContextProvider value={`${baseResource}_comment`}>
        <List
          title={false}
          perPage={10}
          actions={
            <ListActions
              permissions={permissions}
              baseResource={baseResource}
              parentPathS={parentPathS}
              baseIDInformation={baseIDInformation}
            />
          }
          exporter={false}
          empty={false}
          filter={baseIDInformation}
          sort={{ field: "created_at", order: "ASC" }}
        >
          <Datagrid
            bulkActionButtons={false}
            rowClick={(_id, _res, record) =>
              `${parentPathS}/comment/${record.id}/show`
            }
          >
            <TextField source="id" label="Comment ID" />
            <DateField source="created_at" showTime />
            <DateField source="recorded_at" label="Last updated" showTime />
            <IdentityField source="created_by" />
            <TextField source="visibility" />
            <RichTextField source="content" />
          </Datagrid>
        </List>
      </ResourceContextProvider>
    )
  );
};

export const CommentInput = () => {
  const resource = useResourceContext()!;
  const { state: overrideRecord } = useLocation();
  const actualRecord = useRecordContext();

  const baseResource = removeSuffix("_comment", resource);

  const filterRecord = (record: any) => {
    const idField = `${baseResource}_id`;

    const filteredRecord: any = {};
    filteredRecord[idField] = record[idField];
    filteredRecord.visibility = record.visibility;
    filteredRecord.content = record.content;
    return filteredRecord;
  };

  const record: any = filterRecord({ ...actualRecord, ...overrideRecord });

  return (
    <SimpleForm
      record={record}
      maxWidth={1280}
      toolbar={<Toolbar saveAlwaysEnabled />}
    >
      <Stack direction="column" spacing={1}>
        <Typography variant="h6" gutterBottom>
          Basic information
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <TextInput source={`${baseResource}_id`} readOnly />
          <SelectInput
            source="visibility"
            validate={required()}
            defaultValue="same_party"
            choices={["same_party", "any_involved_party"]}
          />
        </InputStack>

        <Typography variant="h6" gutterBottom>
          Content
        </Typography>
        <InputStack direction="row" flexWrap="wrap">
          <RichTextInput
            source="content"
            sx={{ minWidth: { xs: 300, md: 500 } }}
          />
        </InputStack>
      </Stack>
    </SimpleForm>
  );
};

export type CommentHistoryListProps = {
  // API resource where comments are attached
  // (override if not to be derived from URL)
  baseResource?: string;
};

export const CommentHistoryList = (props: CommentHistoryListProps) => {
  const location = useLocation();

  const parentPath = chunksOf(
    2,
    removeSuffix("/comment_history", location.pathname).split("/").slice(1),
  ).map(([resource, id]) => ({
    resource,
    id: Number(id),
  }));

  const baseResource =
    props.baseResource ?? parentPath.map((p) => p.resource).join("_");
  const baseResourceHumanName = capitaliseFirstLetter(
    baseResource.replaceAll("_", " "),
  );

  // ID of the row in the base resource we are listing comments for
  const baseID = parentPath.at(-1)!.id;
  const baseIDInformation: Record<string, number> = {};
  baseIDInformation[`${baseResource}_id`] = baseID;

  // reconstruct as string to make the link later
  const parentPathS = parentPath.map((p) => `/${p.resource}/${p.id}`).join("");

  const ServiceProviderProductApplicationCommentHistoryListFilters = [
    <NumberInput
      key={`${baseResource}_comment_id`}
      min="0"
      label={`${baseResourceHumanName} Comment ID`}
      source={`${baseResource}_comment_id`}
    />,
  ];

  return (
    <List
      resource={`${baseResource}_comment_history`}
      title={`Comment history for ${baseResourceHumanName} ${baseID}`}
      filter={baseIDInformation}
      filters={ServiceProviderProductApplicationCommentHistoryListFilters}
      perPage={25}
      sort={{ field: "created_at", order: "DESC" }}
      empty={false}
    >
      <Datagrid
        rowClick={(_id, _res, record) =>
          `${parentPathS}/comment_history/${record.id}/show`
        }
      >
        <TextField source="id" label="ID" />
        <TextField source="visibility" />
        <IdentityField source="created_by" />
        <RichTextField source="content" />
        <DateField source="recorded_at" showTime />
        <IdentityField source="recorded_by" />
        <DateField source="replaced_at" showTime />
        <IdentityField source="replaced_by" />
      </Datagrid>
    </List>
  );
};
