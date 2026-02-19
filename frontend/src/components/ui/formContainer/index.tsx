import { Container } from "@elhub/ds-components";
import { cn } from "../../../util";

type FormContainerProps = Parameters<typeof Container>[0];

const FormContainer = (props: FormContainerProps) => {
  return (
    <Container
      {...props}
      className={cn(
        "p-3 bg-background flex flex-col gap-5 max-w-7xl",
        props.className,
      )}
    />
  );
};

export default FormContainer;
