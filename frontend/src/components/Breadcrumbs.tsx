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
// Helper to determine if a breadcrumb is a numeric ID
function isBreadcrumbId(breadcrumb: any): boolean {
  if (typeof breadcrumb === "string") {
    return /^\d+$/.test(breadcrumb);
  }
  if (typeof breadcrumb === "number") {
    return /^\d+$/.test(String(breadcrumb));
  }
  if (breadcrumb && typeof breadcrumb.props?.children === "string") {
    return /^\d+$/.test(breadcrumb.props.children);
  }
  return false;
}

export const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  const patchedBreadcrumbs = breadcrumbs.map(({ match, breadcrumb }, idx) => {
    let to = match.pathname;
    if (isBreadcrumbId(breadcrumb) && to !== "/" && !to.endsWith("/show")) {
      to = `${to}/show`;
    }
    return { match: { pathname: to }, breadcrumb };
  });

  return (
    <nav style={{ padding: "1em 0 0 0" }}>
      {patchedBreadcrumbs.map(({ match, breadcrumb }, idx) => (
        <Link key={match.pathname + "-" + idx} to={match.pathname}>
          {breadcrumb}
        </Link>
      ))}
    </nav>
  );
};
