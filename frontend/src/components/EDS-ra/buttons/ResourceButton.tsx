import { useDataProvider, useNotify } from "ra-core";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui";
import { IconExternal } from "@elhub/ds-icons";

type ResourceButtonProps = {
  source: string;
  disabled?: boolean;
};

// Button used in event-related resources to navigate to the concerned resource
export const ResourceButton = ({ source, disabled }: ResourceButtonProps) => {
  const dataProvider = useDataProvider();
  const navigate = useNavigate();
  const notify = useNotify();

  const resource = source.split("/")[1];
  const id = source.split("/")[2];

  const handleClick = async () => {
    // Fetch the resource to ensure it still exists before redirecting
    const { data } = await dataProvider
      .getOne(resource, { id })
      .catch(() => ({ data: undefined })); // not found

    if (data) {
      navigate(`/${resource}/${id}/show`);
    } else {
      notify(
        `The concerned resource (${resource}/${id}) can no longer be accessed.`,
        { type: "error" },
      );
    }
  };

  return (
    <Button
      variant="invisible"
      icon={IconExternal}
      onClick={handleClick}
      disabled={disabled}
    >
      Go to resource
    </Button>
  );
};
