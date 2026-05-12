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
import { EditButton, EventButton, ResourceHistoryButton } from "./buttons";

type SimpleShowLayoutProps = {
  children: ReactNode;
  /*

   Edit button, resource history button, event button are there by default
  */
  extraActions?: ReactNode;
  /** Override the default EditButton (e.g. for nested-route resources) */
  editButton?: ReactNode;
  /** Override the default ResourceHistoryButton (e.g. for nested-route resources) */
  historyButton?: ReactNode;
};

const SimpleShowLayout = ({
  children,
  extraActions,
  editButton,
  historyButton,
}: SimpleShowLayoutProps) => {
  const resource = useResourceContext();
  const { permissions } = usePermissions<Permissions>();

  const canEdit = resource
    ? permissions?.allow(resource as PermissionTarget, "update")
    : false;
  const isHistory = resource?.endsWith("_history");

  return (
    <>
      {!isHistory ? (
        <div className="flex justify-end gap-2">
          {canEdit && (editButton ?? <EditButton />)}
          {extraActions}
          {historyButton ?? <ResourceHistoryButton />}
          <EventButton />
        </div>
      ) : null}
      <Panel border>
        <Content>{children}</Content>
      </Panel>
    </>
  );
};

export const Show = <RecordType extends RaRecord = any>(
  props: ShowBaseProps<RecordType> & SimpleShowLayoutProps,
) => {
  const { children, extraActions, editButton, historyButton, ...rest } = props;

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
      >
        {children}
      </SimpleShowLayout>
    </ShowBase>
  );
};
