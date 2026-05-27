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
    hideLabel?: boolean;
  };

export const ReferenceField = (props: ReferenceFieldProps) => {
  const {
    children,
    emptyText,
    label,
    hideLabel,
    tooltip,
    labelDirection = "row",
    textSize = "small",
    ...rest
  } = props;
  const getRecordRepresentation = useGetRecordRepresentation(rest.reference);

  const content = children ? (
    <ReferenceFieldBase
      {...rest}
      empty={
        emptyText ? <BodyText size={textSize}>{emptyText}</BodyText> : undefined
      }
      loading={<Loader size="small" />}
    >
      {children}
    </ReferenceFieldBase>
  ) : (
    <ReferenceFieldBase
      {...rest}
      empty={
        emptyText ? <BodyText size={textSize}>{emptyText}</BodyText> : undefined
      }
      loading={<Loader size="small" />}
      render={({ referenceRecord }) => (
        <BodyText size={textSize}>
          {getRecordRepresentation(referenceRecord)}
        </BodyText>
      )}
    />
  );

  return (
    <BaseField
      textSize={textSize}
      source={rest.source}
      label={hideLabel ? false : label}
      tooltip={tooltip}
      labelDirection={labelDirection}
    >
      {content}
    </BaseField>
  );
};
