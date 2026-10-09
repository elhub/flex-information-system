import { useGetList } from "ra-core";
import { ArrayInput } from "./ArrayInput";
import { BaseInputProps } from "./BaseInput";

type PartyReferenceArrayInputProps = BaseInputProps & {
  partyType: string;
  placeholder?: string;
  inputClassName?: string;
};

// Multi-select of parties of a given type, e.g. partyType="balance_responsible_party".
// The stored value is the list of party IDs.
export const PartyReferenceArrayInput = ({
  partyType,
  ...rest
}: PartyReferenceArrayInputProps) => {
  const { data } = useGetList("party", {
    filter: { type: partyType },
    pagination: { page: 1, perPage: 5000 },
    sort: { field: "name", order: "ASC" },
  });

  const options = (data ?? []).map((party) => ({
    value: String(party.id),
    label: party.name,
  }));

  return <ArrayInput options={options} {...rest} />;
};
