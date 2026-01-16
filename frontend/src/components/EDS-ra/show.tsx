import { ReactNode } from "react";
import {
  BodyText,
  Content,
  FlexDiv,
  Loader,
  Panel,
} from "@elhub/ds-components";
import { RaRecord, ShowBase, ShowBaseProps } from "ra-core";

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
      {children}
    </ShowBase>
  );
};

type SimpleShowLayoutProps = {
  children: ReactNode;
  actions?: ReactNode[];
};

export const SimpleShowLayout = ({
  children,
  actions,
}: SimpleShowLayoutProps) => (
  <>
    {actions && (
      <FlexDiv style={{ justifyContent: "flex-end", gap: "1rem" }}>
        {actions}
      </FlexDiv>
    )}
    <Panel border>
      <Content>{children}</Content>
    </Panel>
  </>
);
