import { IconArrowLeft } from "@elhub/ds-icons";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { usePreviousPage } from "./NavigationHistoryProvider";
import { Button, Heading } from "./ui";

type ShowPageLayoutProps = {
  backTo: {
    pathname: string;
    label: string;
  };
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
}: ShowPageLayoutProps) => {
  const navigate = useNavigate();
  const previousPage = usePreviousPage();
  const back = previousPage ? previousPage : backTo;

  const handleBack = () => navigate(back.pathname, { replace: true });

  return (
    <div className="flex flex-col gap-4 p-2">
      {alerts}
      <Button
        onClick={handleBack}
        variant="invisible"
        className="max-w-fit"
        icon={IconArrowLeft}
        iconPosition="left"
      >
        Go back to {back.label}
      </Button>

      <div className="flex items-center gap-2">
        <Heading level={2} size="medium">
          {title}
        </Heading>
        {badge && <div className="flex items-center gap-1">{badge}</div>}
      </div>
      {actionBar}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[25%_minmax(0,1fr)]">
        {leftPanel}
        {rightPanel}
      </div>
    </div>
  );
};
