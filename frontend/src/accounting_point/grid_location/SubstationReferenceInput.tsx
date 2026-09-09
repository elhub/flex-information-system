import { BaseInput } from "../../components/EDS-ra/inputs/BaseInput";
import { Combobox } from "../../components/ui";
import { Substation } from "../show/AccountingPointLocationMap";
import { useSubstationReferenceInputController } from "./useSubstationReferenceInputController";

// need at least a name and a business ID to render a substation in the combobox
type SubstationLabel = Pick<Substation, "name" | "business_id">;

type Props = {
  source: string;
  required?: boolean;
  tooltip?: boolean;
  onSelect: (substation: Substation | null) => void;
  knownSubstation?: SubstationLabel | null;
};

// Presentational: RA (useInput/useTranslate), the search query, and
// option/selection mapping live in useSubstationReferenceInputController.
export const SubstationReferenceInput = ({
  source,
  required,
  tooltip,
  onSelect,
  knownSubstation,
}: Props) => {
  const {
    id,
    error,
    descriptionText,
    options,
    selectedOption,
    isFetching,
    handleInputChange,
    handleToggle,
  } = useSubstationReferenceInputController({
    source,
    onSelect,
    knownSubstation,
  });

  return (
    <BaseInput
      source={source}
      descriptionOverride={descriptionText}
      required={required}
      tooltip={tooltip}
      id={id}
      error={error}
      resource="accounting_point_grid_location"
    >
      <Combobox
        options={options}
        filteredOptions={options}
        selectedOptions={selectedOption ? [selectedOption] : []}
        onToggleSelected={handleToggle}
        isLoading={isFetching}
        onChange={handleInputChange}
      />
    </BaseInput>
  );
};
