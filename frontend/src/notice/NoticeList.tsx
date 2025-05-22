import {
  FunctionField,
  List,
  ReferenceField,
  TextField,
  useRecordContext,
} from "react-admin";
import { Datagrid } from "../auth";
import { ResourceButton } from "../components/ResourceButton";

export const NoticeResourceButton = () => {
  const noticeRecord = useRecordContext()!;
  return <ResourceButton source={noticeRecord.source} />;
};

export const NoticeList = () => (
  <List perPage={25} sort={{ field: "id", order: "DESC" }} empty={false}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <ReferenceField source="party_id" reference="party">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="type" />
      <TextField source="source" />
      <FunctionField
        source="data"
        render={(record) => (record.data ? JSON.stringify(record.data) : "{}")}
      />
      <NoticeResourceButton />
    </Datagrid>
  </List>
);
