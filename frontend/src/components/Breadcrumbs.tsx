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

  const patchedBreadcrumbs = breadcrumbs.map(({ match, breadcrumb }, idx) => {
    let to = match.pathname;
    let breadcrumbStr = "";
    if (typeof breadcrumb === "string") {
      breadcrumbStr = breadcrumb;
    } else if (typeof breadcrumb === "number") {
      breadcrumbStr = String(breadcrumb);
    } else if (
      breadcrumb &&
      typeof (breadcrumb as any).props?.children === "string"
    ) {
      breadcrumbStr = (breadcrumb as any).props.children;
    }
    const isId = /^\d+$/.test(breadcrumbStr);
    // Only append /show for numeric IDs, not categories
    if (isId && to !== "/" && !to.endsWith("/show")) {
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
