import {
  AutocompleteInput,
  Datagrid,
  EnumArrayInput,
  List,
  PartyReferenceInput,
  ReferenceField,
  StatusBadgeField,
  TextField,
} from "../components/EDS-ra";
import { BodyText } from "../components/ui";
import { Link } from "../components/ui";
import { noticeStatusVariantMap } from "./noticeStatus";
import noticeTypes from "./noticeTypes";
import { zNotice } from "../generated-client/zod.gen";
import { getFields } from "../zod";
import { useListContext, useRecordContext } from "react-admin";
import { Link as RouterLink } from "react-router-dom";
import { useEffect } from "react";

const DefaultStatusFilter = () => {
  const { filterValues, setFilters } = useListContext();
  useEffect(() => {
    if (!filterValues["status@in"]?.length) {
      setFilters({ ...filterValues, "status@in": ["active"] });
    }
  }, []);
  return null;
};

const SourceLink = ({ label: _label }: { label?: string }) => {
  const noticeRecord = useRecordContext()!;
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Link as={RouterLink} to={`${noticeRecord.source}/show`}>
        {noticeRecord.source}
      </Link>
    </span>
  );
};

const NoticeType = ({ label: _label }: { label?: string }) => {
  const noticeRecord = useRecordContext()!;
  return (
    <BodyText size={"small"}>
      {noticeTypes.find((nt) => nt.id === noticeRecord.type)?.label ??
        noticeRecord.type}
    </BodyText>
  );
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
      <DefaultStatusFilter />
      <Datagrid>
        <TextField source={noticeFields.id.source} />
        <ReferenceField
          source={noticeFields.party_id.source}
          reference="party"
          label="Recipient"
          hideLabel={true}
        >
          <TextField source="name" />
        </ReferenceField>
        <NoticeType label="field.notice.type" />
        <SourceLink label="field.notice.source" />
        <StatusBadgeField
          source={noticeFields.status.source}
          enumKey="notice.status"
          variantMap={noticeStatusVariantMap}
        />
      </Datagrid>
    </List>
  );
};
