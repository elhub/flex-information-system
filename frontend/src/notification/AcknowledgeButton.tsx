import { useRecordContext, useResourceContext, useUpdate } from "ra-core";
import { IconValidationCheck } from "@elhub/ds-icons";
import { Button } from "../components/ui";

export const AcknowledgeButton = () => {
  const record = useRecordContext()!;
  const resource = useResourceContext();
  const [update, { isPending }] = useUpdate();

  return (
    <Button
      variant="invisible"
      icon={IconValidationCheck}
      disabled={record.acknowledged || isPending}
      onClick={() =>
        update(
          resource,
          { id: record.id, data: { acknowledged: true }, previousData: record },
          { mutationMode: "pessimistic" },
        )
      }
    >
      Acknowledge
    </Button>
  );
};
