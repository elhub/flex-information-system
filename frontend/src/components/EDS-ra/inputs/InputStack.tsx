import { Children, cloneElement, isValidElement, ReactNode } from "react";
import { useResourceContext, usePermissions } from "ra-core";
import { Permissions, PermissionTarget } from "../../../auth/permissions";
import { useCreateOrUpdate } from "../../../auth/useCreateOrUpdate";
import { FlexDiv } from "../../ui";

type InputStackProps = {
  children: ReactNode;
  direction?: "row" | "column";
  flexWrap?: "wrap" | "nowrap";
  gap?: string;
  allowAll?: boolean;
  resource?: string;
};

type InputElementProps = {
  source?: string;
  disabled?: boolean;
};

export const InputStack = ({
  children,
  direction = "row",
  flexWrap = "wrap",
  gap = "1rem",
  allowAll = false,
  resource: resourceProp,
}: InputStackProps) => {
  const resourceFromContext = useResourceContext();
  const { permissions } = usePermissions<Permissions>();
  const createOrUpdate = useCreateOrUpdate();

  const resource = resourceProp ?? resourceFromContext;

  const processChild = (child: ReactNode): ReactNode => {
    if (!isValidElement<InputElementProps>(child)) {
      return child;
    }

    const source = child.props.source;
    if (!source) return child;

    const isDisabled =
      child.props.disabled ||
      (!allowAll &&
        createOrUpdate != null &&
        !permissions?.allow(
          `${resource}.${source}` as PermissionTarget,
          createOrUpdate,
        ));

    return cloneElement(child, {
      disabled: isDisabled,
    });
  };

  return (
    <FlexDiv
      style={{
        flexDirection: direction,
        flexWrap,
        gap,
        alignItems: direction === "row" ? "flex-start" : "stretch",
      }}
    >
      {Children.map(children, processChild)}
    </FlexDiv>
  );
};
