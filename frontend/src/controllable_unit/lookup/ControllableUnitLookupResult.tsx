import { useTranslate } from "ra-core";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  callControllableUnitLookup,
  ControllableUnitLookup,
} from "../../generated-client";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import { throwOnError } from "../../util";
import {
  Heading,
  BodyText,
  Button,
  Alert,
  Card,
  CardContent,
  Table,
  Container,
  Loader,
} from "../../components/ui";

type LookupResponse_ControllableUnit =
  ControllableUnitLookup["controllable_units"][number];
type LookupResponse_TechnicalResource =
  LookupResponse_ControllableUnit["technical_resources"][number];

const TechnicalResourceDetails = ({
  technicalResources,
}: {
  technicalResources: LookupResponse_TechnicalResource[];
}) => {
  const translate = useTranslate();

  if (technicalResources.length === 0) {
    return <BodyText>No technical resources</BodyText>;
  }

  return (
    <Container>
      <Heading level={4} size="small">
        Technical resources
      </Heading>
      <Table size="small">
        <Table.Header>
          <Table.ColumnHeader scope="col">
            {translate("field.technical_resource.id")}
          </Table.ColumnHeader>
          <Table.ColumnHeader scope="col">
            {translate("field.technical_resource.name")}
          </Table.ColumnHeader>
          <Table.ColumnHeader scope="col">
            {translate("field.technical_resource.details")}
          </Table.ColumnHeader>
        </Table.Header>
        <Table.Body>
          {technicalResources.map((tr) => (
            <Table.Row key={tr.id}>
              <Table.DataCell>{tr.id}</Table.DataCell>
              <Table.DataCell>{tr.name}</Table.DataCell>
              <Table.DataCell>{tr.details}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export const ControllableUnitLookupResult = () => {
  const [searchParams] = useSearchParams();
  const accountingPointGsrn = searchParams.get("accounting_point");
  const endUserOrgNo = searchParams.get("end_user");

  const {
    data: parsedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["controllableUnitLookup", accountingPointGsrn, endUserOrgNo],
    queryFn: () =>
      callControllableUnitLookup({
        body: {
          end_user: endUserOrgNo!,
          accounting_point: accountingPointGsrn!,
        },
      }).then(throwOnError),
    enabled: !!accountingPointGsrn && !!endUserOrgNo,
  });

  if (!accountingPointGsrn || !endUserOrgNo) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mt-4">
        <Alert variant="error">
          Missing accounting_point or end_user in URL
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mt-4">
        <Alert variant="error">{error.message}</Alert>
      </div>
    );
  }

  if (isLoading || !parsedData) {
    return <Loader size="large" />;
  }

  const cuCount = parsedData.controllable_units.length;
  const hasCUs = cuCount > 0;

  const createUrl =
    `/controllable_unit/create?accounting_point_id=${parsedData.accounting_point.id}` +
    (parsedData.end_user.id ? `&end_user_id=${parsedData.end_user.id}` : "");

  return (
    <div className="flex flex-col gap-5 max-w-4xl mt-4">
      <Heading level={2} size="large">
        Controllable unit lookup
      </Heading>

      <Alert variant="info">
        Accounting point {parsedData.accounting_point.business_id} already has{" "}
        {cuCount} controllable {cuCount === 1 ? "unit" : "units"}. You can
        manage an existing unit or create a new one.
      </Alert>

      <section className="flex flex-col gap-3">
        <Heading level={3} size="medium">
          Create new
        </Heading>
        <Card className="max-w-3xl">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <BodyText>
                Register a new controllable unit for this accounting point.
              </BodyText>
              <Button as={Link} to={createUrl} variant="primary">
                Create new unit
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {hasCUs && (
        <section className="flex flex-col gap-3">
          <Heading level={3} size="medium">
            Existing units
          </Heading>
          <Table>
            <Table.Header>
              <Table.ColumnHeader scope="col"></Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Name</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">Business ID</Table.ColumnHeader>
              <Table.ColumnHeader scope="col">
                Technical resources
              </Table.ColumnHeader>
              <Table.ColumnHeader scope="col" />
            </Table.Header>
            <Table.Body>
              {parsedData.controllable_units.map((cu) => {
                const cuspState: ControllableUnitServiceProviderLocationState =
                  {
                    cusp: {
                      controllable_unit_id: cu.id,
                      end_user_id: parsedData.end_user.id,
                    },
                    cuIDAsNumber: true,
                  };

                return (
                  <Table.ExpandableRow
                    key={cu.id}
                    content={
                      <TechnicalResourceDetails
                        technicalResources={cu.technical_resources}
                      />
                    }
                    expansionDisabled={cu.technical_resources.length === 0}
                  >
                    <Table.DataCell>{cu.name ?? `CU #${cu.id}`}</Table.DataCell>
                    <Table.DataCell>{cu.business_id ?? "—"}</Table.DataCell>
                    <Table.DataCell>
                      {cu.technical_resources.length}
                    </Table.DataCell>
                    <Table.DataCell>
                      <Button
                        as={Link}
                        to="/controllable_unit_service_provider/create"
                        state={cuspState}
                        variant="primary"
                        size="small"
                      >
                        Manage
                      </Button>
                    </Table.DataCell>
                  </Table.ExpandableRow>
                );
              })}
            </Table.Body>
          </Table>
        </section>
      )}
    </div>
  );
};
