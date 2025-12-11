import { Button, ButtonProps, useDataProvider, useNotify } from "react-admin";
import { useNavigate } from "react-router-dom";
import DataObjectIcon from "@mui/icons-material/DataObject";

// button used in event-related resources to navigate to the concerned resource
export const ResourceButton = (props: ButtonProps & { source: string }) => {
  const { source, ...rest } = props;

  const dataProvider = useDataProvider();
  const navigate = useNavigate();
  const notify = useNotify();

  const resource = source.split("/")[1];
  const id = source.split("/")[2];

  return (
    <Button
      onClick={async () => {
        // fetch the resource to ensure it still exists before redirecting
        const { data } = await dataProvider
          .getOne(resource, { id })
          .catch(() => ({ data: undefined })); // not found

        if (data) {
          navigate(`/${resource}/${id}/show`);
        } else {
          notify(
            `The concerned resource (${resource}/${id}) no longer exists.`,
            { type: "error" },
          );
        }
      }}
      label="Go to resource"
      startIcon={<DataObjectIcon />}
      {...rest}
    />
  );
};
