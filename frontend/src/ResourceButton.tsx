import { Button, useGetOne } from "react-admin";
import { Link } from "react-router-dom";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { CircularProgress } from "@mui/material";

// Helper to build UI paths to subresource pages based on `source` fields in
// events and notices, i.e., `resource/id` formats.
// We need this because such fields follow the flat hierarchy of the database
// where everything is a resource (subresources are only in the UI as a way to
// organise and group pages together).
const getSubResourceInformation = (resource: string) => {
  switch (resource) {
    case "party_membership":
      return {
        // the main resource party_membership belongs to
        mainResource: "party",
        // the suffix to add to point to party_membership, from a party's page
        subResource: "membership",
        // the field in party_membership referencing the main resource (party)
        mainIDField: "party_id",
      };
    case "controllable_unit_service_provider":
      return {
        mainResource: "controllable_unit",
        subResource: "service_provider",
        mainIDField: "controllable_unit_id",
      };
    case "technical_resource":
      return {
        mainResource: "controllable_unit",
        subResource: "technical_resource",
        mainIDField: "controllable_unit_id",
      };
    case "service_providing_group_membership":
      return {
        mainResource: "service_providing_group",
        subResource: "membership",
        mainIDField: "service_providing_group_id",
      };
    case "service_providing_group_grid_prequalification":
      return {
        mainResource: "service_providing_group",
        subResource: "grid_prequalification",
        mainIDField: "service_providing_group_id",
      };
    case "service_providing_group_product_application":
      return {
        mainResource: "service_providing_group",
        subResource: "product_application",
        mainIDField: "service_providing_group_id",
      };
    case "service_provider_product_application_comment":
      return {
        mainResource: "service_provider_product_application",
        subResource: "comment",
        mainIDField: "service_provider_product_application_id",
      };
    default:
      return null;
  }
};

// button to use as a link to a resource based on a source format (see above)
export const ResourceButton = (props: any) => {
  const { source, ...rest } = props;

  const resource = source.split("/")[1];
  const id = source.split("/")[2];
  const {
    data: resourceRecord,
    isPending: resourcePending,
    error: resourceError,
  } = useGetOne(resource, { id: id });
  const subResourceInfo = getSubResourceInformation(resource);

  if (resourcePending) {
    return <CircularProgress size={25} thickness={2} />;
  }

  if (resourceError) {
    return null;
  }

  return (
    <Button
      component={Link}
      to={
        subResourceInfo != null
          ? `/${subResourceInfo.mainResource}/${
              resourceRecord[subResourceInfo.mainIDField]
            }/${subResourceInfo.subResource}/${id}/show`
          : `/${resource}/${id}/show`
      }
      label="Go to resource"
      startIcon={<DataObjectIcon />}
      {...rest}
    />
  );
};
