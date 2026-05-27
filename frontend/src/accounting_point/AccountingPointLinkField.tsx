import { useRecordContext, useGetManyAggregate } from "ra-core";
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

  const { data } = useGetManyAggregate(
    "accounting_point",
    { ids: accountingPointId ? [accountingPointId] : [] },
    { enabled: !!accountingPointId },
  );

  const ap = data?.[0];

  if (!ap) return <BodyText size="small">-</BodyText>;

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Link as={RouterLink} to={`/accounting_point/${ap.id}/show`}>
        {ap.business_id}
      </Link>
    </span>
  );
};
