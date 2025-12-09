import {
  AutocompleteInput,
  List,
  ReferenceField,
  TextField,
  useRecordContext,
} from "react-admin";
import { Datagrid, PartyReferenceInput } from "../auth";
import { ResourceButton } from "../components/resource";
import { NoticeShow } from "./NoticeShow";
import noticeTypes from "./noticeTypes";

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
      label="Party"
      noTypeFilter
      key="party"
    />,
    <AutocompleteInput
      key="notice_type"
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
      label="Notice type"
    />,
  ];

  // a defined sort parameter is required there because notice has no ID field
  // cf https://github.com/marmelab/react-admin/blob/27dccfb8519de551ef7e236355860aacef36ef56/packages/ra-core/src/controller/list/useListController.ts#L451-L454
  return (
    <List
      perPage={25}
      filters={filters}
      sort={{ field: "source", order: "DESC" }}
      empty={false}
    >
      <Datagrid expand={NoticeShow} expandSingle={true}>
        <ReferenceField source="party_id" reference="party" sortable={false}>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="type" />
        <TextField source="source" />
        <NoticeResourceButton />
      </Datagrid>
    </List>
  );
};
