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
        <div className="flex flex-wrap self-end items-center gap-2 pr-[var(--eds-size-4)] lg:justify-end">
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
      {alerts}
      <div className="flex flex-col gap-4 pt-4 xl:flex-row xl:items-start">
        <div className="flex flex-col gap-4 xl:w-1/4">
          {summary}
          {viewControls}
        </div>
        <div className="min-w-0 flex-1">{content}</div>
      </div>
    </div>
  );
};
