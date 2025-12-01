import { Edit, Create } from "react-admin";
import { useNavigate } from "react-router-dom";

// Wrapper on Edit to redirect to previous page on submit
// (the redirect property of Edit does not have access to hooks)
export const EditRedirectPreviousPage = (props: any) => {
  const navigate = useNavigate();

  return (
    <Edit
      actions={false} // disable potential Show button
      mutationMode="pessimistic"
      mutationOptions={{ onSuccess: () => navigate(-1) }}
    >
      {props.children}
    </Edit>
  );
};

// Wrapper on Create to redirect to previous page on submit
// (the redirect property of Create does not have access to hooks)
export const CreateRedirectPreviousPage = (props: any) => {
  const navigate = useNavigate();

  return (
    <Create mutationOptions={{ onSuccess: () => navigate(-1) }}>
      {props.children}
    </Create>
  );
};
