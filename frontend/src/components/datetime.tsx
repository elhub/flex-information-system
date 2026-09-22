import z from "zod";

/* Utility to send local (Norwegian) midnight time in addition to just the
   date, sparing the user the need to input it manually.

Just sending a date over the network will result in storing UTC midnight,
which makes the midnight alignment policies fail.

The last example in https://marmelab.com/react-admin/DateInput.html suggests
it is possible to store an ISO string as internal state in a DateInput, instead
of a Date object, which means the full timestamp will be sent over the network.

We know that because the source is a DateInput, `value` does not contain any
time. It will always have the form YYYY-MM-DD. It is our job to add it there,
and we always set it to midnight.

There are many possibilities to denote midnight in ISO format, the shortest one
seemingly being to just add a space after the date.

*/
export const formatDateToMidnightISO = (
  date?: string | null,
): string | null => {
  const dateSchema = z.iso.date().safeParse(date);
  if (!dateSchema.success) {
    return null;
  }

  return new Date(date + " ").toISOString();
};
