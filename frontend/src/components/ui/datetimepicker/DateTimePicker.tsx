import {
  Datepicker as DatepickerComponent,
  DatepickerProps,
} from "@elhub/ds-components";
import styles from "./dateTimePicker.module.css";

export const DateTimePicker = ({ ...rest }: DatepickerProps) => {
  return (
    <DatepickerComponent
      showTimeSelect
      timeFormat="HH:mm"
      dateFormat="dd.MM.yyyy HH:mm"
      {...rest}
      wrapperClassName={styles.edsDatetimepicker}
    />
  );
};
