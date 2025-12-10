import {
  Button,
  ButtonProps,
  useRecordContext,
  useResourceContext,
} from "react-admin";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { useEffect } from "react";

// button used in event-related resources to navigate to the concerned resource
export const ResourceButton = (props: ButtonProps & { source: string }) => {
  const { source, ...rest } = props;

  const resource = source.split("/")[1];
  const id = source.split("/")[2];

  return (
    <Button
      component={Link}
      to={`/${resource}/${id}/show`}
      label="Go to resource"
      startIcon={<DataObjectIcon />}
      {...rest}
    />
  );
};

function hierarchyPath(record: any, resource: string): string {
  switch (resource) {
    case "controllable_unit_service_provider":
      return `/controllable_unit/${record.controllable_unit_id}/service_provider/${record.id}/show`;
    case "controllable_unit_suspension":
      return `/controllable_unit/${record.controllable_unit_id}/suspension/${record.id}/show`;
    case "service_providing_group_grid_prequalification":
      return `/service_providing_group/${record.service_providing_group_id}/grid_prequalification/${record.id}/show`;
    case "service_providing_group_grid_suspension":
      return `/service_providing_group/${record.service_providing_group_id}/grid_suspension/${record.id}/show`;
    case "service_providing_group_membership":
      return `/service_providing_group/${record.service_providing_group_id}/membership/${record.id}/show`;
    case "service_providing_group_product_application":
      return `/service_providing_group/${record.service_providing_group_id}/product_application/${record.id}/show`;
    case "service_providing_group_product_suspension":
      return `/service_providing_group/${record.service_providing_group_id}/product_suspension/${record.id}/show`;
    default:
      return "";
  }
}

// component that automatically redirects from the URL of a show page in flat
// format to the actual resource's show page in our nested format
export const ResourceHierarchyRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = useRecordContext();
  const resource = useResourceContext();

  useEffect(() => {
    if (resource && record && location.pathname.includes(resource))
      navigate(hierarchyPath(record, resource), { replace: true });
  }, [resource, record, navigate, location.pathname]);

  return null;
};
