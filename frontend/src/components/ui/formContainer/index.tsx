import { Container } from "@elhub/ds-components";
import styles from "./formContainer.module.css";

type FormContainerProps = Parameters<typeof Container>[0];

const FormContainer = (props: FormContainerProps) => {
  return <Container {...props} className={styles.formContainer} />;
};

export default FormContainer;
