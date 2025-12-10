import { Chip } from "@mui/material";
import { ControllableUnitSuspension } from "../../../generated-client";

export const Suspensions = ({
  suspensions,
}: {
  suspensions: ControllableUnitSuspension[] | undefined;
}) => {
  if (!suspensions?.length) {
    return null;
  }

  return (
    <>
      {suspensions?.map((suspension) => (
        <Chip color="error" key={suspension.id} label={suspension.reason} />
      ))}
    </>
  );
};
