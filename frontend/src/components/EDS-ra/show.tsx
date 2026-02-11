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
};

const SimpleShowLayout = ({
  children,
  extraActions,
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
          {canEdit && <EditButton />}
          {extraActions}
          <ResourceHistoryButton />
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
  const { children, extraActions, ...rest } = props;

  return (
    <ShowBase
      {...rest}
      loading={<Loader />}
      error={<BodyText>Something went wrong</BodyText>}
    >
      <SimpleShowLayout extraActions={extraActions}>
        {children}
      </SimpleShowLayout>
    </ShowBase>
  );
};
