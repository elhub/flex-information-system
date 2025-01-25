import { useContext } from "react";
import { CreateContext, EditContext } from "react-admin";

// tell whether we are in a Create page or an Edit page
// allows factoring both pages by managing permissions the same way
export const useCreateOrUpdate: () => "create" | "update" | null = () => {
  const create = useContext(CreateContext);
  const edit = useContext(EditContext);

  if (create?.resource) return "create";
  else if (edit?.resource) return "update";
  else return null;
};
