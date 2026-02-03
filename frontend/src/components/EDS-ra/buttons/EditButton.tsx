import React from "react";
import { Button } from "../../ui";
import { useRecordContext, useResourceContext } from "ra-core";
import { IconPencil } from "@elhub/ds-icons";
import { useNavigate } from "react-router-dom";

type EditButtonProps = {
  disabled?: boolean;
};

export const EditButton = (props: EditButtonProps) => {
  const { disabled } = props;
  const resource = useResourceContext();
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record || record.id == null) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${resource}/${record.id}/edit`);
  };

  return (
    <Button
      variant="invisible"
      size="medium"
      disabled={disabled}
      icon={IconPencil}
      onClick={handleClick}
    >
      Edit
    </Button>
  );
};
