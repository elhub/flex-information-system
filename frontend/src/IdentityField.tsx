import { FunctionField, ReferenceField } from "react-admin";

// field to display an identity as human-readable information
export const IdentityField = (props: any) => (
  <ReferenceField reference="identity" {...props}>
    <FunctionField
      render={(record) => {
        console.log(JSON.stringify(record));
        return (
          (record.entity_name ?? "<private>") +
          (record.party_name ? ` as ${record.party_name}` : "")
        );
      }}
    />
  </ReferenceField>
);
