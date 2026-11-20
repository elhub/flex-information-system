import {
  useRecordContext,
  useResourceContext,
  useTranslate,
  useUpdate,
} from "ra-core";
import { useQueryClient } from "@tanstack/react-query";
import { IconValidationCheck } from "@elhub/ds-icons";
import { Button } from "../components/ui";

export const AcknowledgeButton = ({
  record: recordProp,
}: {
  record?: { id: number; acknowledged: boolean };
}) => {
  const contextRecord = useRecordContext();
  const record = recordProp ?? contextRecord!;
  const contextResource = useResourceContext();
  const resource = contextResource ?? "notification";
  const translate = useTranslate();
  const queryClient = useQueryClient();
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
          {
            mutationMode: "pessimistic",
            onSuccess: () =>
              queryClient.invalidateQueries({ queryKey: ["notification"] }),
          },
        )
      }
    >
      {translate("text.notification.acknowledge")}
    </Button>
  );
};
