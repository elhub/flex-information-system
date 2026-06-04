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
          This allows you to manage
          <dl className="pl-2">
            <dt className="mt-2 font-semibold">Party access</dt>
            <dd>
              Allow people to act on behalf of the organisations market parties.
            </dd>
            <dt className="mt-2 font-semibold">API clients</dt>
            <dd>Manage entity clients for the organisation.</dd>
            <dt className="mt-2 font-semibold">Organisation representatives</dt>
            <dd>Add and remove representatives for the organisation.</dd>
          </dl>
        </p>
      </CardContent>
    </Card>
  );
};
