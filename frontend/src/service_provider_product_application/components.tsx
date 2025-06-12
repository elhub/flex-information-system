import { useGetList, useGetOne, useRecordContext, Button } from "react-admin";
import Alert from "@mui/material/Alert";
import { AlertTitle } from "@mui/material";
import { Link } from "react-router-dom";
import FolderSharedIcon from "@mui/icons-material/FolderShared";

// component showing a message to inform SO about other applications from the
// same service provider that may have been handled by another SO
export const ServiceProviderProductApplicationAlreadyQualified = () => {
  const record = useRecordContext()!;

  const { data: spParty, isLoading: isLoadingParty } = useGetOne("party", {
    id: record.service_provider_id,
  });

  const { data, isLoading: isLoadingSPPA } = useGetList(
    "service_provider_product_application",
    {
      filter: {
        "id@neq": record.id,
        service_provider_id: record.service_provider_id,
      },
    },
  );

  if (isLoadingParty || isLoadingSPPA) return null;

  // if the record is already qualified, this component is useless
  if (record.status == "qualified") return null;

  const productTypesInCurrentSPPA = new Set(record.product_type_ids);

  // all product types this SP is qualified for, by other SOs
  const qualifiedProductTypes = new Set(
    data
      ?.filter((sppa) => sppa.status == "qualified")
      .flatMap((sppa) => sppa.product_type_ids),
  );

  // all product types this SP is being qualified for, by other SOs
  const qualifyingProductTypes = new Set(
    data
      ?.filter((sppa) => sppa.status != "qualified")
      .flatMap((sppa) => sppa.product_type_ids),
  );

  const qualifiedProductTypesInCurrentSPPA =
    productTypesInCurrentSPPA.intersection(qualifiedProductTypes);

  const qualifyingProductTypesInCurrentSPPA = productTypesInCurrentSPPA
    .difference(qualifiedProductTypesInCurrentSPPA)
    .intersection(qualifyingProductTypes);

  if (qualifiedProductTypesInCurrentSPPA.size == productTypesInCurrentSPPA.size)
    return (
      <Alert severity="success">
        <AlertTitle>Previously qualified</AlertTitle>
        {spParty.name} has already been qualified by another system operator for
        all product types in this application.
      </Alert>
    );

  if (qualifyingProductTypesInCurrentSPPA.size > 0)
    return (
      <Alert severity="info">
        <AlertTitle>Ongoing application(s)</AlertTitle>
        {spParty.name} is currently being qualified by another system operator
        for some of the product types in this application.
      </Alert>
    );

  return (
    <Alert severity="info">
      <AlertTitle>First application</AlertTitle>
      {spParty.name} has never been qualified for the product types in this
      application.
    </Alert>
  );
};

// button linking to a filtered list of SPPA that have been created for the
// same SP as in the current SPPA
export const SPPAForSPButton = () => {
  const { service_provider_id } = useRecordContext()!;

  const filter =
    "?filter=" +
    encodeURIComponent(`{ "service_provider_id": ${service_provider_id} }`);

  return (
    <Button
      component={Link}
      to={`/service_provider_product_application${filter}`}
      startIcon={<FolderSharedIcon />}
      label="See all applications from this service provider to any system operator"
    />
  );
};
