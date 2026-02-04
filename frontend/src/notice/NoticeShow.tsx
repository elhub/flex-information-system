import {
  DateField,
  EnumField,
  ReferenceField,
  Show,
  TextField,
} from "../components/EDS-ra";
import { Content, Heading, VerticalSpace } from "../components/ui";
import { NoticeShowDetails } from "./NoticeShowDetails";

export const NoticeShow = () => (
  <Show>
    <Heading level={2} size="small" spacing>
      Basic information
    </Heading>
    <Content>
      <TextField source="id" label />
      <ReferenceField source="party_id" reference="party" label>
        <TextField source="name" />
      </ReferenceField>
      <TextField source="type" label />
      <TextField source="source" label />
      <EnumField source="status" enumKey="notice.status" label />
      <DateField source="recorded_at" showTime label />
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
