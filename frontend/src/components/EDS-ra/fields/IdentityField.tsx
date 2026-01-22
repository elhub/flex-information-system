import { BodyText, Loader } from "../../ui";
import { ReferenceFieldBase, useRecordContext } from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

type IdentityFieldProps = BaseFieldProps;

export const IdentityField = (props: IdentityFieldProps) => {
  const { source, label, tooltip, ...rest } = props;
  const record = useRecordContext();

  if (record?.[source] === 0) {
    return (
      <BaseField source={source} label={label} tooltip={tooltip}>
        <BodyText>System</BodyText>
      </BaseField>
    );
  }

  return (
    <BaseField source={source} label={label} tooltip={tooltip}>
      <ReferenceFieldBase
        reference="identity"
        source={source}
        loading={<Loader size="small" />}
        render={({ referenceRecord }) => {
          if (!referenceRecord) {
            return null;
          }
          const entityName = referenceRecord.entity_name ?? "<private>";
          const partyName = referenceRecord.party_name
            ? ` as ${referenceRecord.party_name}`
            : "";
          return <BodyText>{`${entityName}${partyName}`}</BodyText>;
        }}
        {...rest}
      />
    </BaseField>
  );
};
