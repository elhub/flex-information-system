import { ReactNode } from "react";
import { Heading } from "./ui";

type ShowPageLayoutProps = {
  title: string;
  badge?: ReactNode;
  alerts?: ReactNode;
  actionBar?: ReactNode;
  titleExtra?: ReactNode;
  children: [ReactNode, ReactNode];
};

export const ShowPageLayout = ({
  title,
  badge,
  alerts,
  actionBar,
  titleExtra,
  children: [leftPanel, rightPanel],
}: ShowPageLayoutProps) => {
  return (
    <div className="flex flex-col gap-4 p-2">
      {alerts}
      <div className="flex items-center gap-2">
        <Heading level={2} size="xlarge">
          {title}
        </Heading>
        {badge && <div className="flex items-center gap-1">{badge}</div>}
        {titleExtra && <div className="ml-auto">{titleExtra}</div>}
      </div>
      {actionBar}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[25%_minmax(0,1fr)]">
        {leftPanel}
        {rightPanel}
      </div>
    </div>
  );
};
