import {
  DateField,
  EnumField,
  ReferenceField,
  Show,
  TextField,
} from "../components/EDS-ra";
import { Content, Heading, VerticalSpace } from "../components/ui";
import { zNotice } from "../generated-client/zod.gen";
import { getFields } from "../util";
import { NoticeShowDetails } from "./NoticeShowDetails";

export const NoticeShow = () => {
  const noticeFields = getFields(zNotice.shape);

  return (
    <Show>
      <Heading level={2} size="small" spacing>
        Basic information
      </Heading>
      <Content>
        <TextField source={noticeFields.id.source} label />
        <ReferenceField
          source={noticeFields.party_id.source}
          reference="party"
          label
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source={noticeFields.type.source} label />
        <TextField source={noticeFields.source.source} label />
        <EnumField
          source={noticeFields.status.source}
          enumKey="notice.status"
          label
        />
        <DateField source={noticeFields.recorded_at.source} showTime label />
      </Content>

      <VerticalSpace />
      <Heading level={2} size="small" spacing>
        Details
      </Heading>
      <Content>
        <NoticeShowDetails />
      </Content>
    </Show>
  );
};
