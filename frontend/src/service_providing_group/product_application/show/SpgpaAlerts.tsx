import { ServiceProvidingGroupProductApplication } from "../../../generated-client";
import { Alert, BodyText } from "../../../components/ui";
import { useGetIdentity } from "react-admin";

type Props = {
  spgpa: ServiceProvidingGroupProductApplication;
};

export const SpgpaAlerts = ({ spgpa }: Props) => {
  const { data: identity } = useGetIdentity();
  const isSystemOperator = identity?.role === "flex_system_operator";

  if (!isSystemOperator || spgpa.status !== "requested") {
    return null;
  }

  return (
    <Alert variant="info" className="max-w-3xl gap-4">
      <BodyText>
        The procuring system operator must start prequalification or
        verification within 4 weeks of this application's creation.
      </BodyText>
    </Alert>
  );
};
