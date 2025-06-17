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
  return noticeRecord.source ? (
    <ResourceButton source={noticeRecord.source} />
  ) : null;
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
      <NoticeResourceButton />
    </Datagrid>
  </List>
);
