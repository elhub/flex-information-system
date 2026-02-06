import { useTranslate } from "ra-core";
import { Link, useLocation } from "react-router-dom";
import { zControllableUnitLookup } from "../../generated-client/zod.gen";
import { ControllableUnitLookup } from "../../generated-client";
import { ControllableUnitServiceProviderLocationState } from "../service_provider/ControllableUnitServiceProviderInput";
import { ControllableUnitInputLocationState } from "../ControllableUnitInput";
import {
  Heading,
  BodyText,
  FlexDiv,
  Button,
  Card,
  CardHeader,
  CardHeaderContent,
  CardTitle,
  CardContent,
  CardFooter,
  Table,
} from "../../components/ui";
import { LabelValue } from "../../components/LabelValue";

type LookupResponse_ControllableUnit =
  ControllableUnitLookup["controllable_units"][number];
type LookupResponse_TechnicalResource =
  LookupResponse_ControllableUnit["technical_resources"][number];

const CreateCUButton = ({
  accountingPointId,
  endUserId,
}: {
  accountingPointId: number;
  endUserId?: number;
}) => {
  const cuspLocationState: ControllableUnitInputLocationState = {
    controllableUnit: {
      accounting_point_id: accountingPointId,
    },
    endUserId: endUserId,
  };

  return (
    <Button
      as={Link}
      to="/controllable_unit/create"
      state={cuspLocationState}
      variant="primary"
      size="large"
      style={{ maxWidth: "500px" }}
    >
      Create a new controllable unit
    </Button>
  );
};

const TechnicalResourceList = ({
  technical_resources,
}: {
  technical_resources: LookupResponse_TechnicalResource[];
}) => {
  const translate = useTranslate();

  if (technical_resources.length === 0) {
    return <BodyText>No technical resources </BodyText>;
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader scope="col">
            {translate("field.technical_resource.id")}
          </Table.ColumnHeader>
          <Table.ColumnHeader scope="col">
            {translate("field.technical_resource.name")}
          </Table.ColumnHeader>
          <Table.ColumnHeader scope="col">
            {translate("field.technical_resource.details")}
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {technical_resources.map((tr: LookupResponse_TechnicalResource) => (
          <Table.Row key={tr.id}>
            <Table.DataCell>{tr.id}</Table.DataCell>
            <Table.DataCell>{tr.name}</Table.DataCell>
            <Table.DataCell>{tr.details}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const ControllableUnitLookupResultItem = ({
  controllableUnit,
  endUserId,
}: {
  controllableUnit: LookupResponse_ControllableUnit;
  endUserId: number;
}) => {
  const cuspLocationState: ControllableUnitServiceProviderLocationState = {
    cusp: {
      controllable_unit_id: controllableUnit.id,
      end_user_id: endUserId,
    },
    cuIDAsNumber: true,
  };

  return (
    <Card style={{ maxWidth: "1000px" }}>
      <CardHeader>
        <CardHeaderContent>
          <FlexDiv
            style={{ flexDirection: "column", gap: "var(--eds-size-3)" }}
          >
            <LabelValue
              labelKey="controllable_unit.id"
              value={controllableUnit.id}
            />
            <LabelValue
              labelKey="controllable_unit.business_id"
              value={controllableUnit.business_id}
            />
            <LabelValue
              labelKey="controllable_unit.name"
              value={controllableUnit.name}
            />
          </FlexDiv>
        </CardHeaderContent>
      </CardHeader>
      <CardContent>
        <TechnicalResourceList
          technical_resources={controllableUnit.technical_resources}
        />
      </CardContent>
      <CardFooter style={{ justifyContent: "flex-end" }}>
        <Button
          as={Link}
          to="/controllable_unit_service_provider/create"
          state={cuspLocationState}
          variant="primary"
        >
          Manage Controllable Unit
        </Button>
      </CardFooter>
    </Card>
  );
};

export const ControllableUnitLookupResult = () => {
  const {
    state: { result },
  } = useLocation();
  const controllableUnitLookUpResult = zControllableUnitLookup.parse(
    result ?? {},
  );

  return (
    <FlexDiv style={{ flexDirection: "column", gap: "var(--eds-size-3)" }}>
      <Heading level={2} size="large">
        Controllable Unit Lookup Result
      </Heading>
      <Heading level={3} size="medium">
        Technical information
      </Heading>
      <FlexDiv style={{ gap: "var(--eds-size-3)", flexWrap: "wrap" }}>
        <Card>
          <CardHeader>
            <CardHeaderContent>
              <CardTitle>Accounting point</CardTitle>
            </CardHeaderContent>
          </CardHeader>
          <CardContent>
            <FlexDiv
              style={{ flexDirection: "column", gap: "var(--eds-size-3)" }}
            >
              <LabelValue
                labelKey="accounting_point.id"
                value={controllableUnitLookUpResult.accounting_point.id}
              />
              <LabelValue
                labelKey="accounting_point.business_id"
                value={
                  controllableUnitLookUpResult.accounting_point.business_id
                }
              />
              <LabelValue
                labelKey="accounting_point_end_user.end_user_id"
                value={controllableUnitLookUpResult.end_user.id}
              />
            </FlexDiv>
          </CardContent>
        </Card>
      </FlexDiv>
      <CreateCUButton
        accountingPointId={controllableUnitLookUpResult.accounting_point.id}
        endUserId={controllableUnitLookUpResult.end_user.id}
      />
      {controllableUnitLookUpResult.controllable_units.length == 0 ? (
        <BodyText>No controllable units found</BodyText>
      ) : (
        <>
          <Heading level={3} size="medium">
            Controllable units found:
          </Heading>
          <FlexDiv
            style={{ flexDirection: "column", gap: "var(--eds-size-3)" }}
          >
            {controllableUnitLookUpResult.controllable_units.map((cu) => (
              <ControllableUnitLookupResultItem
                key={cu.id}
                controllableUnit={cu}
                endUserId={controllableUnitLookUpResult.end_user.id}
              />
            ))}
          </FlexDiv>
        </>
      )}
    </FlexDiv>
  );
};
