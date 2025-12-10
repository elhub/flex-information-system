import { Button, ButtonProps } from "react-admin";
import { Link } from "react-router-dom";
import DataObjectIcon from "@mui/icons-material/DataObject";

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
