import {
  Datepicker as DatepickerComponent,
  DatepickerProps,
} from "@elhub/ds-components";
import { isToday } from "date-fns";
import styles from "./datetimepicker.module.css";

export const DateTimePicker = ({ ...rest }: DatepickerProps) => {
  return (
    <DatepickerComponent
      showTimeSelect
      timeFormat="HH:mm"
      dateFormat="dd.MM.yyyy HH:mm"
      dayClassName={(date) => (isToday(date) ? styles.today : "")}
      {...rest}
      wrapperClassName="w-48"
    />
  );
};
