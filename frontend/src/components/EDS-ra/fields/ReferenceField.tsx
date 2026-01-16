import { ReactNode } from "react";
import { BodyText, Loader } from "../../ui";
import {
  ReferenceFieldBase,
  ReferenceFieldBaseProps,
  useGetRecordRepresentation,
} from "ra-core";
import { BaseField, BaseFieldProps } from "./BaseField";

type ReferenceFieldProps = ReferenceFieldBaseProps &
  Omit<BaseFieldProps, "children"> & {
    emptyText?: ReactNode;
  };

export const ReferenceField = (props: ReferenceFieldProps) => {
  const { children, emptyText, label, tooltip, ...rest } = props;
  const getRecordRepresentation = useGetRecordRepresentation(rest.reference);

  const content = children ? (
    <ReferenceFieldBase
      {...rest}
      empty={emptyText ? <BodyText>{emptyText}</BodyText> : undefined}
      loading={<Loader size="small" />}
    >
      {children}
    </ReferenceFieldBase>
  ) : (
    <ReferenceFieldBase
      {...rest}
      empty={emptyText ? <BodyText>{emptyText}</BodyText> : undefined}
      loading={<Loader size="small" />}
      render={({ referenceRecord }) => (
        <BodyText>{getRecordRepresentation(referenceRecord)}</BodyText>
      )}
    />
  );

  return (
    <BaseField source={rest.source} label={label} tooltip={tooltip}>
      {content}
    </BaseField>
  );
};
