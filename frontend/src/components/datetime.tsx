import {
  DateFieldProps,
  DateInput,
  DateInputProps,
  DateTimeInputProps,
  DateField as RADateField,
  DateTimeInput as RADateTimeInput,
} from "react-admin";

export const DateField = (props: DateFieldProps) => (
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
export const DateTimeInput = (props: DateTimeInputProps) => (
  <RADateTimeInput
    // implementation based on the default one
    // cf https://github.com/marmelab/react-admin/blob/107db17fd690c0611c91a80ac858b5c6c91b3fc2/packages/ra-core/src/form/useInput.ts#L22
    parse={(value: string) =>
      value == "" ? null : new Date(value).toISOString()
    }
    {...props}
  />
);

/* Wrapper around the DateInput component from React Admin to send local
   (Norwegian) midnight time in addition to just the date, sparing the user
   the need to input it manually.

For the same reasons as above, just sending a date over the network will result
in storing UTC midnight, which makes the midnight alignment policies fail.

The last example in https://marmelab.com/react-admin/DateInput.html suggests
it is possible to store an ISO string as internal state in a DateInput, instead
of a Date object, which means the full timestamp will be sent over the network.
So we can just add the same kind of wrapper as the component above.

The difference is that here, we know that because the component is a DateInput,
`value` does not contain any time. It will always have the form YYYY-MM-DD.
It is our job to add it there, and we always set it to midnight.

There are many possibilities to denote midnight in ISO format, the shortest one
seemingly being to just add a space after the date.

*/
export const formatDateToMidnightISO = (
  date?: string | null,
): string | null => {
  return date ? new Date(date + " ").toISOString() : null;
};

export const MidnightDateInput = (props: DateInputProps) => (
  <DateInput parse={formatDateToMidnightISO} {...props} />
);
