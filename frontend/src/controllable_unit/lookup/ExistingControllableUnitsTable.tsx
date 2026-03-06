import { Link } from "react-router-dom";
import { useTranslate } from "ra-core";
import { ControllableUnitLookup } from "../../generated-client";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import {
  Heading,
  BodyText,
  Button,
  Table,
  Container,
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

type ExistingControllableUnitsTableProps = {
  controllableUnits: LookupResponse_ControllableUnit[];
  endUserId: number;
};

export const ExistingControllableUnitsTable = ({
  controllableUnits,
  endUserId,
}: ExistingControllableUnitsTableProps) => {
  return (
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
          {controllableUnits.map((cu) => {
            const cuspState: ControllableUnitServiceProviderLocationState = {
              cusp: {
                controllable_unit_id: cu.id,
                end_user_id: endUserId,
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
                <Table.DataCell>{cu.technical_resources.length}</Table.DataCell>
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
  );
};
