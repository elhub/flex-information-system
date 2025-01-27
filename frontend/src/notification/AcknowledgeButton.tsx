import { UpdateButton, useRecordContext } from "react-admin";
import CheckIcon from "@mui/icons-material/Check";

export const AcknowledgeButton = (props: any) => {
  const record = useRecordContext()!;

  return (
    <UpdateButton
      label="Acknowledge"
      data={{ acknowledged: true }}
      startIcon={<CheckIcon />}
      disabled={record.acknowledged}
      {...props}
    />
  );
};
