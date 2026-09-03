import { ReactNode } from "react";
import { BodyText, Content, Loader, Panel } from "../ui";
import { Permissions, PermissionTarget } from "../../auth/permissions";
import {
  RaRecord,
  ShowBase,
  ShowBaseProps,
  usePermissions,
  useResourceContext,
} from "ra-core";
import { EditButton } from "./buttons/EditButton";
import { EventButton } from "./buttons/EventButton";
import { ResourceHistoryButton } from "./buttons/ResourceHistoryButton";

type SimpleShowLayoutProps = {
  children: ReactNode;
  /** Extra actions rendered alongside the default buttons (non-history view only) */
  extraActions?: ReactNode;
  /** Override the default EditButton (e.g. for nested-route resources) */
  editButton?: ReactNode;
  /**
   * Override the default ResourceHistoryButton.
   * Pass `null` to hide it entirely.
   */
  historyButton?: ReactNode | null;
  /**
   * Override the default EventButton.
   * Pass `null` to hide it, or e.g. `<EventButton filterOnSubject />` to customise.
   * Defaults to `<EventButton />`.
   */
  eventButton?: ReactNode | null;
};

const SimpleShowLayout = ({
  children,
  extraActions,
  editButton,
  historyButton,
  eventButton = <EventButton />,
}: SimpleShowLayoutProps) => {
  const resource = useResourceContext();
  const { permissions } = usePermissions<Permissions>();

  const canEdit = resource
    ? permissions?.allow(resource as PermissionTarget, "update")
    : false;
  const isHistory = resource?.endsWith("_history");

  return (
    <>
      {!isHistory && (
        <div className="flex justify-end gap-2">
          {canEdit && (editButton ?? <EditButton />)}
          {extraActions}
          {historyButton === null
            ? null
            : (historyButton ?? <ResourceHistoryButton />)}
          {eventButton}
        </div>
      )}
      <Panel border>
        <Content>{children}</Content>
      </Panel>
    </>
  );
};

export const Show = <RecordType extends RaRecord = any>(
  props: ShowBaseProps<RecordType> & SimpleShowLayoutProps,
) => {
  const {
    children,
    extraActions,
    editButton,
    historyButton,
    eventButton,
    ...rest
  } = props;

  return (
    <ShowBase
      {...rest}
      loading={<Loader />}
      error={<BodyText>Something went wrong</BodyText>}
    >
      <SimpleShowLayout
        extraActions={extraActions}
        editButton={editButton}
        historyButton={historyButton}
        eventButton={eventButton}
      >
        {children}
      </SimpleShowLayout>
    </ShowBase>
  );
};
