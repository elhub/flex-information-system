import {
  Datepicker as DatepickerComponent,
  DatepickerProps,
} from "@elhub/ds-components";
import styles from "./datepicker.module.css";
export const Datepicker = ({ ...rest }: DatepickerProps) => {
  return <DatepickerComponent {...rest} className={styles.edsDatepicker} />;
};
