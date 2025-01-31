import { FunctionField, ReferenceField, useRecordContext } from "react-admin";

// field to display an identity as human-readable information
export const IdentityField = (props: any) => {
  const { source, ...rest } = props;

  const record = useRecordContext()!;

  // operations done by the system have 0 as identity (cf db/flex_users.sql)
  return record[source] == 0 ? (
    "System"
  ) : (
    <ReferenceField reference="identity" source={source} {...rest}>
      <FunctionField
        render={(record) =>
          (record.entity_name ?? "<private>") +
          (record.party_name ? ` as ${record.party_name}` : "")
        }
      />
    </ReferenceField>
  );
};
