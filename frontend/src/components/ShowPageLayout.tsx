import { IconArrowLeft } from "@elhub/ds-icons";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, Heading } from "./ui";

type ShowPageLayoutProps = {
  backTo: string;
  title: string;
  badge?: ReactNode;
  alerts?: ReactNode;
  actionBar?: ReactNode;
  children: [ReactNode, ReactNode];
};

export const ShowPageLayout = ({
  backTo,
  title,
  badge,
  alerts,
  actionBar,
  children: [leftPanel, rightPanel],
}: ShowPageLayoutProps) => (
  <div className="flex flex-col gap-4 p-2">
    {alerts}
    <div className="flex items-center gap-2">
      <Button
        as={RouterLink}
        to={backTo}
        variant="invisible"
        icon={IconArrowLeft}
      />
      <Heading level={2} size="medium">
        {title}
      </Heading>
      {badge && <div className="flex items-center gap-1">{badge}</div>}
    </div>
    {actionBar}
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[475px_minmax(0,1fr)]">
      {leftPanel}
      {rightPanel}
    </div>
  </div>
);
