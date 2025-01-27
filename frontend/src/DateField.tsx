import { DateField as RADateField } from "react-admin";

export const DateField = (props: any) => {
  return (
    <RADateField
      locales="no-NO"
      options={{
        timeZoneName: props?.showTime ? "short" : undefined,
        hour12: false,
      }}
      {...props}
    />
  );
};
