import {
  AutocompleteInput,
  Datagrid,
  DateField,
  EnumArrayInput,
  EnumField,
  List,
  PartyReferenceInput,
  ReferenceField,
  ResourceButton,
  TextField,
} from "../components/EDS-ra";
import noticeTypes from "./noticeTypes";
import { zNotice } from "../generated-client/zod.gen";
import { getFields } from "../util";
import { useRecordContext } from "react-admin";

const NoticeResourceButton = () => {
  const noticeRecord = useRecordContext()!;
  return noticeRecord.source ? (
    <ResourceButton source={noticeRecord.source} />
  ) : null;
};

export const NoticeList = () => {
  const filters = [
    <PartyReferenceInput
      source="party_id"
      label="field.notice.party_id"
      noTypeFilter
      key="party"
    />,
    <AutocompleteInput
      key="notice_type"
      source="type"
      choices={noticeTypes.map((nt) => ({ id: nt.id, name: nt.label }))}
      style={{ width: "600px" }}
    />,
    <EnumArrayInput
      key="notice_status"
      enumKey="notice.status"
      source="status@in"
    />,
  ];

  const noticeFields = getFields(zNotice.shape);

  return (
    <List perPage={25} filters={filters} empty={false}>
      <Datagrid>
        <TextField source={noticeFields.id.source} />
        <ReferenceField source={noticeFields.party_id.source} reference="party">
          <TextField source="name" />
        </ReferenceField>
        <TextField source={noticeFields.type.source} />
        <TextField source={noticeFields.source.source} />
        <EnumField
          source={noticeFields.status.source}
          enumKey="notice.status"
        />
        <DateField source={noticeFields.recorded_at.source} showTime />
        <NoticeResourceButton />
      </Datagrid>
    </List>
  );
};
