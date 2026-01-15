import { ReactNode } from "react";
import { BodyText, Loader, Tag } from "@elhub/ds-components";
import {
  ReferenceFieldBase,
  ReferenceFieldBaseProps,
  useGetRecordRepresentation,
  useRecordContext,
  useTranslate,
} from "ra-core";

type TextFieldProps = {
  source: string;
  emptyText?: ReactNode;
  label?: string;
};

export const TextField = ({ source, emptyText }: TextFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];

  if (value == null || value === "") {
    return emptyText ? <BodyText>{emptyText}</BodyText> : null;
  }

  return <BodyText>{String(value)}</BodyText>;
};

type DateFieldProps = {
  source: string;
  showTime?: boolean;
  emptyText?: ReactNode;
  label?: string;
};

export const DateField = ({ source, showTime, emptyText }: DateFieldProps) => {
  const record = useRecordContext();
  const value = record?.[source];

  if (!value) {
    return emptyText ? <BodyText>{emptyText}</BodyText> : null;
  }

  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = showTime
    ? { dateStyle: "medium", timeStyle: "short", hour12: false }
    : { dateStyle: "medium" };

  return <BodyText>{date.toLocaleString("no-NO", options)}</BodyText>;
};

type EnumFieldProps = {
  source: string;
  enumKey: string;
  label?: string;
};

export const EnumField = ({ enumKey, source }: EnumFieldProps) => {
  const translate = useTranslate();
  const record = useRecordContext();
  const value = record?.[source];

  if (value == null || value === "") {
    return null;
  }

  return <Tag variant="info">{translate(`enum.${enumKey}.${value}`)}</Tag>;
};

type ReferenceFieldProps = ReferenceFieldBaseProps & {
  emptyText?: ReactNode;
  label?: string;
};

export const ReferenceField = (props: ReferenceFieldProps) => {
  const { children, emptyText, ...rest } = props;
  const getRecordRepresentation = useGetRecordRepresentation(rest.reference);

  if (children) {
    return (
      <ReferenceFieldBase
        {...rest}
        empty={emptyText ? <BodyText>{emptyText}</BodyText> : undefined}
        loading={<Loader size="small" />}
      >
        {children}
      </ReferenceFieldBase>
    );
  }

  return (
    <ReferenceFieldBase
      {...rest}
      empty={emptyText ? <BodyText>{emptyText}</BodyText> : undefined}
      loading={<Loader size="small" />}
      render={({ referenceRecord }) => (
        <BodyText>{getRecordRepresentation(referenceRecord)}</BodyText>
      )}
    />
  );
};
