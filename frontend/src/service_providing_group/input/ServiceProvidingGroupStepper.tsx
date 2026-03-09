import { Stepper } from "../../components/ui";

const STEPS = [
  { value: 1, title: "Create group" },
  { value: 2, title: "Add members" },
];

export const ServiceProvidingGroupStepper = ({
  activeStep,
}: {
  activeStep: number;
}) => (
  <Stepper steps={STEPS} activeStep={activeStep} orientation="horizontal" />
);
