import { Fragment, ReactElement, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { BodyText, Heading, Badge, Alert, Dropdown } from "./ui";
import { MoreActionsButton } from "./MoreActionsButton";

export type UtilityAction = {
  to: string;
  title: string;
  icon?: ReactNode;
  external?: boolean;
  shouldShow?: boolean;
};

export type UtilityActionGroup = {
  label: string;
  actions: UtilityAction[];
};

type ShowPageResourceLayoutProps = {
  secondaryHeaderText: string;
  mainHeaderText: string;
  status?: ReactElement<typeof Badge>;
  alerts?: ReactElement<typeof Alert>;
  viewControls?: ReactNode;
  utilityActions?: UtilityActionGroup[];
  workflowActions?: ReactNode;
  summary: ReactNode;
  content: ReactNode;
};

type ResourceHeaderProps = {
  secondaryText: string;
  mainText: string;
  status?: ReactElement<typeof Badge>;
};

const ResourceHeader = ({
  secondaryText,
  mainText,
  status,
}: ResourceHeaderProps) => {
  return (
    <div className="min-w-0">
      <BodyText size="small" className="text-semantic-text-secondary">
        {secondaryText}
      </BodyText>
      <div className="flex flex-wrap items-center gap-2">
        <Heading level={2} size="xlarge">
          {mainText}
        </Heading>
        {status && <div className="flex items-center gap-1">{status}</div>}
      </div>
    </div>
  );
};

type ActionGroupProps = {
  group: UtilityActionGroup;
  showDivider: boolean;
};

const ActionGroup = ({ group, showDivider }: ActionGroupProps) => (
  <Fragment>
    {showDivider && <Dropdown.Menu.Divider />}
    <Dropdown.Menu.GroupedList.Heading>
      <BodyText weight="bold">{group.label}</BodyText>
    </Dropdown.Menu.GroupedList.Heading>
    <Dropdown.Menu.GroupedList>
      {group.actions.map((action) => (
        <Dropdown.Menu.GroupedList.Item
          key={action.to}
          as={RouterLink}
          to={action.to}
          {...(action.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <div className="flex items-center gap-2">
            {action.icon}
            {action.title}
          </div>
        </Dropdown.Menu.GroupedList.Item>
      ))}
    </Dropdown.Menu.GroupedList>
  </Fragment>
);

type UtilityActionsProps = {
  utilityActionGroups: UtilityActionGroup[];
};

const UtilityActions = ({ utilityActionGroups }: UtilityActionsProps) => {
  const visibleGroups = utilityActionGroups
    .map((group) => ({
      ...group,
      actions: group.actions.filter((action) => action.shouldShow ?? true),
    }))
    .filter((group) => group.actions.length > 0);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center lg:ml-2">
      <Dropdown>
        <MoreActionsButton />
        <Dropdown.Menu arrow placement="bottom-start">
          {visibleGroups.map((group, index) => (
            <ActionGroup
              key={group.label}
              group={group}
              showDivider={index > 0}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

type HeaderRowProps = {
  secondaryHeaderText: string;
  mainHeaderText: string;
  status?: ReactElement<typeof Badge>;
  workflowActions?: ReactNode;
  utilityActions?: UtilityActionGroup[];
};

const HeaderRow = ({
  secondaryHeaderText,
  mainHeaderText,
  status,
  workflowActions,
  utilityActions,
}: HeaderRowProps) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <ResourceHeader
      secondaryText={secondaryHeaderText}
      mainText={mainHeaderText}
      status={status}
    />
    <div className="flex flex-wrap self-end items-center gap-2 pr-[var(--eds-size-4)] lg:justify-end">
      {workflowActions && (
        <div className="flex flex-wrap items-center gap-2">
          {workflowActions}
        </div>
      )}
      {utilityActions && (
        <UtilityActions utilityActionGroups={utilityActions} />
      )}
    </div>
  </div>
);

type ResourceBodyProps = {
  summary: ReactNode;
  viewControls?: ReactNode;
  content: ReactNode;
};

const ResourceBody = ({
  summary,
  viewControls,
  content,
}: ResourceBodyProps) => (
  <div className="flex flex-col gap-4 pt-4 xl:flex-row xl:items-start">
    <div className="flex flex-col gap-4 xl:w-1/4">
      {summary}
      {viewControls}
    </div>
    <div className="min-w-0 flex-1">{content}</div>
  </div>
);

export const ShowPageResourceLayout = ({
  secondaryHeaderText,
  mainHeaderText,
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
      <HeaderRow
        secondaryHeaderText={secondaryHeaderText}
        mainHeaderText={mainHeaderText}
        status={status}
        workflowActions={workflowActions}
        utilityActions={utilityActions}
      />
      {alerts}
      <ResourceBody
        summary={summary}
        viewControls={viewControls}
        content={content}
      />
    </div>
  );
};
