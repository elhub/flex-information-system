import { useGetManyAggregate, useRecordContext } from "ra-core";
import { BodyText } from "../components/ui/index";

type AccountingPointTextFieldProps = {
  source: string;
  label?: string;
};

export const AccountingPointTextField = ({
  source: _source,
}: AccountingPointTextFieldProps) => {
  const record = useRecordContext();
  const accountingPointId = record?.[_source];

  let accountingPoint = record?.accounting_point;
  const { data } = useGetManyAggregate(
    "accounting_point",
    { ids: accountingPointId ? [accountingPointId] : [] },
    { enabled: accountingPoint === undefined },
  );

  if (data) {
    accountingPoint = data?.[0];
  }

  if (!accountingPoint) return <BodyText size="small">-</BodyText>;

  return <BodyText>{accountingPoint.business_id}</BodyText>;
};
