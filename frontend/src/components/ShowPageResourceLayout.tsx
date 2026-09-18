import { ReactNode } from "react";
import { BodyText, Heading } from "./ui";

type ShowPageResourceLayoutProps = {
  resourceType: ReactNode;
  resourceName: ReactNode;
  status?: ReactNode;
  alerts?: ReactNode;
  viewControls?: ReactNode;
  utilityActions?: ReactNode;
  workflowActions?: ReactNode;
  summary: ReactNode;
  content: ReactNode;
};

export const ShowPageResourceLayout = ({
  resourceType,
  resourceName,
  status,
  alerts,
  viewControls,
  utilityActions,
  workflowActions,
  summary,
  content,
}: ShowPageResourceLayoutProps) => {
  return (
    <div className="flex flex-col gap-4 p-2">
      {alerts}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <BodyText size="small" className="text-semantic-text-secondary">
            {resourceType}
          </BodyText>
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={2} size="xlarge">
              {resourceName}
            </Heading>
            {status && <div className="flex items-center gap-1">{status}</div>}
          </div>
        </div>
        <div className="flex flex-wrap self-end items-center gap-2 lg:justify-end">
          {viewControls}
          {workflowActions && (
            <div className="flex flex-wrap items-center gap-2">
              {workflowActions}
            </div>
          )}
          {utilityActions && (
            <div className="flex items-center lg:ml-2">{utilityActions}</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[25%_minmax(0,1fr)]">
        {summary}
        {content}
      </div>
    </div>
  );
};
