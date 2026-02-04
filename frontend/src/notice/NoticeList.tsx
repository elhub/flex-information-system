import {
  AutocompleteInput,
  List,
  ReferenceField,
  TextField,
  useRecordContext,
} from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { ResourceButton } from "../components/ResourceButton";
import noticeTypes from "./noticeTypes";
import { EnumArrayInput, EnumField } from "../components/enum";
import { DateField } from "../components/datetime";

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
      label="field.notice.type"
      source="type"
      TextFieldProps={{
        style: {
          width: "600px",
        },
      }}
      slotProps={{
        popper: {
          style: {
            width: "fit-content",
          },
        },
      }}
      choices={noticeTypes.map((nt) => ({ id: nt.id, name: nt.label }))}
    />,
    <EnumArrayInput
      key="notice_status"
      label="field.notice.status"
      enumKey="notice.status"
      source="status@in"
      alwaysOn
    />,
  ];

  return (
    <List perPage={25} filters={filters} empty={false}>
      <Datagrid>
        <TextField source="id" label="field.notice.id" />
        <ReferenceField
          source="party_id"
          reference="party"
          sortable={false}
          label="field.notice.party_id"
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="type" label="field.notice.type" />
        <TextField source="source" label="field.notice.source" />
        <EnumField
          source="status"
          enumKey="notice.status"
          label="field.notice.status"
        />
        <DateField
          source="recorded_at"
          showTime
          label="field.notice.recorded_at"
        />
        <NoticeResourceButton />
      </Datagrid>
    </List>
  );
};
