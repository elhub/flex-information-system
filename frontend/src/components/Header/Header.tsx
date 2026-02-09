import { Link } from "../ui";
import { Link as NavLink } from "react-router-dom";

import UserDropdown from "./UserDropdown";
import { Header as DSHeader } from "../ui";
export const Header = () => {
  return (
    <DSHeader className="flex justify-between items-center p-4 bg-semantic-background-action-primary h-12 fixed z-modal top-0 w-full">
      <Link
        className="flex items-center gap-2"
        as={NavLink}
        to={"/"}
        aria-label="My page"
      >
        <img
          className="h-10"
          src="/static-assets/logo.svg"
          alt="Euroflex logo"
        />
      </Link>
      <UserDropdown />
    </DSHeader>
  );
};
