import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent } from "../../components/ui";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  borderClass: string;
  iconBgClass: string;
  actionLabel?: string;
  actionTo?: string;
};

export const StatCard = ({
  label,
  value,
  icon,
  borderClass,
  iconBgClass,
  actionLabel,
  actionTo,
}: StatCardProps) => (
  <Card className={`flex-1 border-l-4 ${borderClass}`}>
    <CardContent className="flex items-center gap-4 py-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-semantic-text-subtle mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-semantic-text leading-none">
          {value}
        </p>
      </div>
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
