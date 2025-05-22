import { Link as RaLink } from "react-admin";
import { styled } from "@mui/material";

import useBreadcrumbs from "use-react-router-breadcrumbs";

const Link = styled(RaLink)`
  padding: 0.5em;

  &::before {
    content: "/";
    padding-right: 0.5em;
  }
`;

export const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  return (
    <nav style={{ padding: "1em 0 0 0" }}>
      {breadcrumbs.map(({ match, breadcrumb }) => (
        <Link
          key={match.pathname}
          to={match.pathname}
          style={{
            padding: "0.5em",
          }}
        >
          {breadcrumb}
        </Link>
      ))}
    </nav>
  );
};
