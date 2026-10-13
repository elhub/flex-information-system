import { Link as RouterLink } from "react-router-dom";
import { FieldLabel } from "../intl/field-labels";
import { LabelValue } from "./LabelValue";
import {
  Card,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
} from "./ui";

type PartyCardProps = {
  title: string;
  content:
    { label?: string; labelKey?: FieldLabel; value?: string }[] | undefined;
  to: string;
  linkText: string;
};

export const ResourceCard = ({
  title,
  content,
  to,
  linkText,
}: PartyCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardHeaderContent>
          <CardTitle>{title}</CardTitle>
        </CardHeaderContent>
      </CardHeader>
      <CardContent className="grid flex-1 content-start gap-4 sm:grid-cols-2">
        {content?.map(({ label, labelKey, value }) => (
          <div key={label ?? labelKey}>
            <LabelValue
              size="small"
              label={label}
              labelKey={labelKey}
              value={value}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="tertiary" size="small" as={RouterLink} to={to}>
          {linkText}
        </Button>
      </CardFooter>
    </Card>
  );
};
