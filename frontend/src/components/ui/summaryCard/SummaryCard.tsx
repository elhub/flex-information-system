import type { ReactNode } from "react";
import { BodyText, Heading } from "..";
import { cn } from "../../../util";

// A read-only stat card showing an aggregate value, with a colored accent.
// `trailing` is shown at the right of the header row (e.g. a badge), and
// `children` below the subtitle (e.g. detail lines).
export const SummaryCard = ({
  label,
  value,
  icon,
  accentClassName,
  trailing,
  subtitle,
  children,
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accentClassName: string;
  trailing?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col gap-1 rounded-lg border-l-4 bg-semantic-background p-4",
      accentClassName,
      className,
    )}
  >
    <div className="flex min-h-7 items-center gap-2">
      {icon}
      <BodyText size="small" className="text-semantic-text-subtle">
        {label}
      </BodyText>
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
    <Heading level={4} size="small">
      {value}
    </Heading>
    {subtitle && (
      <BodyText size="small" className="text-semantic-text-subtle">
        {subtitle}
      </BodyText>
    )}
    {children}
  </div>
);
