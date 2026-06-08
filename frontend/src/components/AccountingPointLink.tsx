type Props = {
  businessId: string | undefined;
  accountingPointId: number | undefined;
};

export const AccountingPointLink = ({
  businessId,
  accountingPointId,
}: Props) => {
  if (!businessId) return <span className="whitespace-nowrap">—</span>;

  if (!accountingPointId)
    return <span className="whitespace-nowrap">{businessId}</span>;

  return (
    <span className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
      <a
        href={`#/accounting_point/${accountingPointId}/show`}
        target="_blank"
        rel="noopener noreferrer"
        className="eds-link"
      >
        {businessId}
      </a>
    </span>
  );
};
