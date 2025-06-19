import {
  FunctionField,
  List,
  ReferenceField,
  TextField,
  useRecordContext,
  Button,
} from "react-admin";
import { Datagrid } from "../auth";
import { ResourceButton } from "../components/ResourceButton";
import { Link } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";

const NoticeResourceButton = () => {
  const noticeRecord = useRecordContext()!;
  return noticeRecord.source ? (
    <ResourceButton source={noticeRecord.source} />
  ) : null;
};

const NoticeActionButton = () => {
  const noticeRecord = useRecordContext()!;

  switch (noticeRecord.type) {
    case "no.elhub.flex.party.missing":
      return (
        <Button
          component={Link}
          to="/party/create"
          label="Create party"
          state={noticeRecord.data}
          startIcon={<PersonAddIcon />}
        />
      );
    case "no.elhub.flex.party.outdated":
      return (
        <Button
          component={Link}
          to={`/party/${noticeRecord.source.split("/")[2]}`}
          label="Update party"
          state={noticeRecord.data}
          startIcon={<EditIcon />}
        />
      );
    default:
      return null;
  }
};

export const NoticeList = () => (
  // a defined sort parameter is required there because notice has no ID field
  // cf https://github.com/marmelab/react-admin/blob/27dccfb8519de551ef7e236355860aacef36ef56/packages/ra-core/src/controller/list/useListController.ts#L451-L454
  <List perPage={25} sort={{ field: "type", order: "ASC" }} empty={false}>
    <Datagrid>
      <ReferenceField source="party_id" reference="party">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="type" />
      <TextField source="source" />
      <FunctionField
        source="data"
        render={(record) => (record.data ? JSON.stringify(record.data) : "{}")}
      />
      <NoticeActionButton />
      <NoticeResourceButton />
    </Datagrid>
  </List>
);
