import { ReactElement, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { BodyText, Heading, Alert, Dropdown, Tabs, Button, Panel } from "./ui";
import { StatusBadge, StatusVariant } from "./StatusBadge";
import { LabelValue, LabelValueProps } from "./LabelValue";
import { IconChevronDown } from "@elhub/ds-icons";

export type AlertType = {
  severity: "info" | "success" | "warning" | "error";
  heading?: string;
  body: string;
};

export type ResourceStatus = {
  label: string;
  status: StatusVariant["status"];
  icon?: StatusVariant["icon"];
  tooltip?: string;
};

export type UtilityAction = {
  to: string;
  title: string;
  icon?: ReactNode;
  external?: boolean;
  shouldShow?: boolean;
};

type UtilityActionGroup = {
  label: string;
  actions: UtilityAction[];
};

export type ResourceSummaryField = {
  shouldShow?: boolean;
} & LabelValueProps;

type ResourceShowLayoutProps = {
  secondaryHeaderText: string;
  mainHeaderText: string;
  status?: ResourceStatus;
  alerts?: AlertType;
  displayControls?: ReactNode;
  moreActions?: UtilityAction[];
  moreNavigationActions?: UtilityAction[];
  workflowActions?: ReactNode;
  summary: ResourceSummaryField[];
  content: ReactElement<typeof Tabs>;
};

export type ResourceSummaryPanelProps = {
  fields: ResourceSummaryField[];
};

export const ResourceSummaryPanel = ({ fields }: ResourceSummaryPanelProps) => (
  <div className="flex flex-col gap-4">
    <Panel
      border
      className="bg-semantic-background-alternative h-fit p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4">
        {fields
          .filter((field) => field.shouldShow ?? true)
          .map(({ shouldShow: _shouldShow, ...labelValueProps }, index) => (
            <LabelValue
              key={labelValueProps.label ?? labelValueProps.labelKey ?? index}
              size="large"
              {...labelValueProps}
            />
          ))}
      </div>
    </Panel>
  </div>
);

type ResourceTitleProps = {
  secondaryText: string;
  mainText: string;
  status?: ResourceStatus;
};

const ResourceTitle = ({
  secondaryText,
  mainText,
  status,
}: ResourceTitleProps) => {
  return (
    <div className="min-w-0">
      <BodyText size="small" className="text-semantic-text-secondary">
        {secondaryText}
      </BodyText>
      <div className="flex flex-wrap items-center gap-2">
        <Heading level={2} size="xlarge">
          {mainText}
        </Heading>
        {status && (
          <div className="flex items-center gap-1">
            <StatusBadge {...status} />
          </div>
        )}
      </div>
    </div>
  );
};

type ResourceAlertProps = {
  alert: AlertType;
};

const ResourceAlert = ({ alert }: ResourceAlertProps) => (
  <Alert variant={alert.severity} className="max-w-3xl gap-4">
    {alert.heading && <Heading size="xsmall">{alert.heading}</Heading>}
    <BodyText>{alert.body}</BodyText>
  </Alert>
);

type ActionGroupSectionProps = {
  group: UtilityActionGroup;
  showDivider: boolean;
};

const ActionGroupSection = ({
  group,
  showDivider,
}: ActionGroupSectionProps) => (
  <>
    {showDivider && <Dropdown.Menu.Divider />}
    <Dropdown.Menu.GroupedList.Heading>
      {group.label}
    </Dropdown.Menu.GroupedList.Heading>
    <Dropdown.Menu.GroupedList>
      {group.actions
        .filter((action) => action.shouldShow ?? false)
        .map((action) => (
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
  </>
);

type MoreActionsMenuProps = {
  actions?: UtilityAction[];
  navigationActions?: UtilityAction[];
};

const MoreActionsMenu = ({
  actions,
  navigationActions,
}: MoreActionsMenuProps) => {
  const visibleActionCount = (group: UtilityActionGroup) =>
    group.actions.filter((action) => action.shouldShow ?? false).length;

  const visibleGroups: UtilityActionGroup[] = [
    { label: "Actions", actions: actions ?? [] },
    { label: "Navigate to", actions: navigationActions ?? [] },
  ].filter((group) => visibleActionCount(group) > 0);

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center lg:ml-2">
      <Dropdown>
        <Button
          as={Dropdown.Toggle}
          variant="tertiary"
          icon={IconChevronDown}
          iconPosition="right"
          aria-label="More actions"
        >
          More
        </Button>
        <Dropdown.Menu arrow placement="bottom-start">
          {visibleGroups.map((group, index) => (
            <ActionGroupSection
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

type ResourceHeaderProps = {
  secondaryHeaderText: string;
  mainHeaderText: string;
  status?: ResourceStatus;
  workflowActions?: ReactNode;
  moreActions?: UtilityAction[];
  moreNavigationActions?: UtilityAction[];
};

const ResourceHeader = ({
  secondaryHeaderText,
  mainHeaderText,
  status,
  workflowActions,
  moreActions,
  moreNavigationActions,
}: ResourceHeaderProps) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <ResourceTitle
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
      <MoreActionsMenu
        actions={moreActions}
        navigationActions={moreNavigationActions}
      />
    </div>
  </div>
);

type ResourceBodyProps = {
  summary: ResourceSummaryField[];
  displayControls?: ReactNode;
  content: ReactNode;
};

const ResourceBody = ({
  summary,
  displayControls,
  content,
}: ResourceBodyProps) => (
  <div className="flex flex-col gap-4 pt-4 xl:flex-row xl:items-start">
    <div className="flex flex-col gap-4 xl:w-1/4">
      <ResourceSummaryPanel fields={summary} />
      {displayControls}
    </div>
    <div className="min-w-0 flex-1">{content}</div>
  </div>
);

export const ResourceShowLayout = ({
  secondaryHeaderText,
  mainHeaderText,
  status,
  alerts,
  displayControls,
  moreActions,
  moreNavigationActions,
  workflowActions,
  summary,
  content,
}: ResourceShowLayoutProps) => {
  return (
    <div className="flex flex-col gap-4 p-2">
      <ResourceHeader
        secondaryHeaderText={secondaryHeaderText}
        mainHeaderText={mainHeaderText}
        status={status}
        workflowActions={workflowActions}
        moreActions={moreActions}
        moreNavigationActions={moreNavigationActions}
      />
      {alerts && <ResourceAlert alert={alerts} />}
      <ResourceBody
        summary={summary}
        displayControls={displayControls}
        content={content}
      />
    </div>
  );
};
