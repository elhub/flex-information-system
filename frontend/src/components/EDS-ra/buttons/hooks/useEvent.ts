import { usePermissions, useRecordContext, useResourceContext } from "ra-core";
import { Permissions } from "../../../../auth/permissions";

export type UseEventProps = {
  filterOnSubject?: boolean;
  recordId?: string;
};

export const useEvent = (props: UseEventProps = {}) => {
  const resource = useResourceContext();
  const record = useRecordContext();
  const { permissions } = usePermissions<Permissions>();

  const actualRecordId = props.recordId || record?.id;
  const canRead = permissions?.allow("event", "read");

  const filterField = props.filterOnSubject ? "subject" : "source";
  const filter =
    "?filter=" +
    encodeURIComponent(
      `{ "${filterField}@like": "/${resource}/${actualRecordId}" }`,
    );

  const to = `/event${filter}`;
  const disabled = !canRead;

  return { to, disabled };
};
