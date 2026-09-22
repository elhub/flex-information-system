import { useGetManyAggregate, useRecordContext } from "ra-core";
import { Link as RouterLink } from "react-router-dom";
import { BodyText, Link } from "../components/ui";

type AccountingPointLinkFieldProps = {
  source: string;
  label?: string;
};

export const AccountingPointLinkField = ({
  source: _source,
}: AccountingPointLinkFieldProps) => {
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

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Link as={RouterLink} to={`/accounting_point/${accountingPoint.id}/show`}>
        {accountingPoint.business_id}
      </Link>
    </span>
  );
};
