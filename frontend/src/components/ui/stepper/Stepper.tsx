import { Stepper as EdsStepper, StepperProps } from "@elhub/ds-components";
import styles from "./Stepper.module.css";

export const Stepper = (props: StepperProps) => (
  <div className={styles.stepper}>
    <EdsStepper {...props} />
  </div>
);
