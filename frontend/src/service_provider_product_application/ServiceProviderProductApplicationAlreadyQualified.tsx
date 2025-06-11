import { useGetList, useRecordContext } from "react-admin";
import Alert from "@mui/material/Alert";
import { AlertTitle } from "@mui/material";

export const ServiceProviderProductApplicationAlreadyQualified = () => {
  const record = useRecordContext()!;

  const { data, isLoading } = useGetList(
    "service_provider_product_application",
    {
      filter: {
        service_provider_id: record.service_provider_id,
        status: "qualified",
      },
    },
  );

  if (isLoading) return null;

  // all product types qualified for this SP, by the targeted SO or others
  const alreadyQualifiedProductTypes = new Set(
    data?.flatMap((sppa) => sppa.product_type_ids),
  );

  // product types in the current application that have never been qualified
  const neverQualified = new Set(record.product_type_ids)
    .difference(alreadyQualifiedProductTypes)
    .keys()
    .toArray();

  return neverQualified.length == 0 ? (
    <Alert severity="success">
      <AlertTitle>Previously qualified</AlertTitle>
      All product types in this application have already been qualified for this
      service provider.
    </Alert>
  ) : (
    <Alert severity="info">
      <AlertTitle>First application</AlertTitle>
      At least one product type in this application has never been qualified for
      this service provider before.
    </Alert>
  );
};
