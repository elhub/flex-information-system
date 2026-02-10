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
import { getFields } from "../zod";
import { useRecordContext } from "react-admin";

const NoticeResourceButton = () => {
  const noticeRecord = useRecordContext()!;
  return noticeRecord.source ? (
    <ResourceButton source={noticeRecord.source} />
  ) : null;
};

export const NoticeList = () => {
  const noticeFields = getFields(zNotice.shape);

  const filters = [
    <PartyReferenceInput
      source={noticeFields.party_id.source}
      label="field.notice.party_id"
      noTypeFilter
      key="party"
    />,
    <AutocompleteInput
      key="notice_type"
      source={noticeFields.type.source}
      choices={noticeTypes.map((nt) => ({ id: nt.id, name: nt.label }))}
      style={{ width: "600px" }}
    />,
    <EnumArrayInput
      key="notice_status"
      enumKey="notice.status"
      source="status@in"
    />,
  ];

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
