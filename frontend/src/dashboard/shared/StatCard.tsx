import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent } from "../../components/ui";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  borderClass: string;
  iconBgClass: string;
  linkTo?: string;
  actionLabel?: string;
  actionTo?: string;
};

export const StatCard = ({
  label,
  value,
  icon,
  borderClass,
  iconBgClass,
  linkTo,
  actionLabel,
  actionTo,
}: StatCardProps) => {
  const underlineOnHover = linkTo
    ? "group-hover:underline group-focus-visible:underline"
    : "";

  const summary = (
    <>
      <p
        className={`text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-1 ${underlineOnHover}`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold text-semantic-text leading-none ${underlineOnHover}`}
      >
        {value}
      </p>
    </>
  );

  return (
    <Card className={`flex-1 border-l-4 ${borderClass}`}>
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}
        >
          {icon}
        </div>
        {linkTo ? (
          <Link to={linkTo} className="group flex-1 no-underline">
            {summary}
          </Link>
        ) : (
          <div className="flex-1">{summary}</div>
        )}
        {actionLabel && actionTo && (
          <Button
            as={Link}
            to={actionTo}
            variant="invisible"
            className="text-sm font-medium hover:underline flex-shrink-0"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
