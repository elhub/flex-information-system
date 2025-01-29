import {
  DateField as RADateField,
  DateTimeInput as RADateTimeInput,
} from "react-admin";

export const DateField = (props: any) => (
  <RADateField
    locales="no-NO"
    options={{
      timeZoneName: props?.showTime ? "short" : undefined,
      hour12: false,
    }}
    {...props}
  />
);

/* Wrapper around the DateTimeInput component from React Admin.

cf https://marmelab.com/react-admin/doc/5.5/DateTimeInput.html :

    After modification by the user, the value is stored as a Date object, using
    the browser's timezone. When transformed to JSON, the date is serialized as
    a string in the ISO 8601 format (‘yyyy-MM-ddThh:mm’).

The second sentence here seems to suggest that the stored string does not have
a timezone annotation. By default, sending such a string over the API call will
result in the database considering it as UTC. This is acceptable if the UI
component does the conversion to UTC before stripping the timezone annotation
from the string. Unfortunately, after testing, it does not seem to be the case.

The following code makes sure the local timezone is taken into account in the
creation of the string :

- The Date object is created from a string without timezone that comes from the
  UI component, and this class uses the browser's timezone by default.

  cf https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format :

      When the time zone offset is absent, [...] date-time forms are interpreted
      as a local time.

  It means the timezone is taken into account in this Date object.

- The toISOString method turns it back into a string, i.e., the expected format
  for the API, but making the conversion using the timezone instead of just
  forgetting it.

  NB: the end timezone happens to be UTC, but this is just an implementation
  detail as long as it is annotated, which is the case according to the docs.

  cf https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
*/
export const DateTimeInput = (props: any) => (
  <RADateTimeInput
    // implementation based on the default one
    // cf https://github.com/marmelab/react-admin/blob/107db17fd690c0611c91a80ac858b5c6c91b3fc2/packages/ra-core/src/form/useInput.ts#L22
    parse={(value: string) =>
      value == "" ? null : new Date(value).toISOString()
    }
    {...props}
  />
);
