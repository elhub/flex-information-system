import React from "react";
import { Button } from "../../ui";
import { useResourceContext } from "ra-core";
import { IconPlus } from "@elhub/ds-icons";
import { useNavigate } from "react-router-dom";

type CreateButtonProps = {
  disabled?: boolean;
};

export const CreateButton = (props: CreateButtonProps) => {
  const { disabled } = props;
  const resource = useResourceContext();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/${resource}/create`);
  };

  return (
    <Button
      variant="primary"
      size="medium"
      disabled={disabled}
      icon={IconPlus}
      onClick={handleClick}
    >
      Create
    </Button>
  );
};
