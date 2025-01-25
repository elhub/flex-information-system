import { FunctionField, NumberInput, useTranslateLabel } from "react-admin";

export const UnitField = ({ unit, source, ...props }: any) => (
  <FunctionField
    source={source}
    render={(record) =>
      record[source] && record[source] != null
        ? `${record[source]} ${unit}`
        : null
    }
    {...props}
  />
);

export const UnitInput = ({ unit, source, ...props }: any) => {
  const translateLabel = useTranslateLabel();

  return (
    <NumberInput
      source={source}
      label={`${translateLabel({ source })} (${unit})`}
      {...props}
    />
  );
};
