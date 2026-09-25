import {
  Datepicker as DatepickerComponent,
  DatepickerProps,
} from "@elhub/ds-components";
import { isToday } from "date-fns";
import styles from "./datepicker.module.css";
export const Datepicker = ({ ...rest }: DatepickerProps) => {
  return (
    <DatepickerComponent
      dayClassName={(date) => (isToday(date) ? styles.today : "")}
      {...rest}
      className={styles.edsDatepicker}
    />
  );
};
