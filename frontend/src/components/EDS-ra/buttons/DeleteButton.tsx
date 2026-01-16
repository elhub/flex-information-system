import { ReactNode, MouseEvent } from "react";
import { Button } from "@elhub/ds-components";
import {
  useDeleteController,
  UseDeleteControllerParams,
  useRecordContext,
  useResourceContext,
} from "ra-core";
import { IconCross } from "@elhub/ds-icons";

type DeleteButtonProps = UseDeleteControllerParams & {
  label?: ReactNode;
  disabled?: boolean;
};

export const DeleteButton = (props: DeleteButtonProps) => {
  const { label, disabled, ...rest } = props;
  const record = useRecordContext(props);
  const resource = useResourceContext(props);

  const { handleDelete, isPending } = useDeleteController({
    ...rest,
    record,
    resource,
  });

  if (!record || record.id == null) {
    return null;
  }

  return (
    <Button
      variant="caution"
      size="small"
      disabled={disabled || isPending}
      icon={IconCross}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        handleDelete();
      }}
    >
      {label}
    </Button>
  );
};
