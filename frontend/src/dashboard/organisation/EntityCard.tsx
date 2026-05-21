import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import type { Entity } from "../../generated-client/types.gen";
import { Link } from "react-router-dom";

type Props = {
  entity: Entity;
};

export const EntityCard = ({ entity }: Props) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {entity.name} - {entity.business_id}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-semantic-text">
        <p>
          You are logged in as a representative of the organisation{" "}
          <Link
            to={`/entity/${entity.id}/show`}
            className="text-primary underline hover:opacity-80"
          >
            {entity.name} ({entity.business_id})
          </Link>
          .
        </p>
        <p>
          This allows you to view and manage people and access for parties that
          belong to this organisation.
        </p>
        <p>
          The organisation has the following parties. Click a party to view more
          details or manage people and accesses for them.
        </p>
      </CardContent>
    </Card>
  );
};
