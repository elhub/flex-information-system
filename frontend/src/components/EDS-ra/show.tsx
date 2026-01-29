import { ReactNode } from "react";
import { BodyText, Content, FlexDiv, Loader, Panel } from "../ui";
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
};

const SimpleShowLayout = ({ children }: SimpleShowLayoutProps) => {
  const resource = useResourceContext();
  const { permissions } = usePermissions<Permissions>();

  const canEdit = resource
    ? permissions?.allow(resource as PermissionTarget, "update")
    : false;
  const isHistory = resource?.endsWith("_history");

  return (
    <>
      {!isHistory ? (
        <FlexDiv style={{ justifyContent: "flex-end", gap: "1rem" }}>
          {canEdit && <EditButton />}
          <ResourceHistoryButton />
          <EventButton />
        </FlexDiv>
      ) : null}
      <Panel border>
        <Content>{children}</Content>
      </Panel>
    </>
  );
};

export const Show = <RecordType extends RaRecord = any>(
  props: ShowBaseProps<RecordType>,
) => {
  const { children, ...rest } = props;

  return (
    <ShowBase
      {...rest}
      loading={<Loader />}
      error={<BodyText>Something went wrong</BodyText>}
    >
      <SimpleShowLayout>{children}</SimpleShowLayout>
    </ShowBase>
  );
};
