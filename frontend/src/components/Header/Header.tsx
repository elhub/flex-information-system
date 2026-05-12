import UserDropdown from "./UserDropdown";
import { Header as DSHeader } from "../ui";
import { HeaderNav } from "./HeaderNav";
import { NavLink } from "react-router-dom";
import { Link } from "../ui";

export const Header = () => {
  return (
    <DSHeader className="w-full p-0">
      <div className="flex h-12 items-center justify-between bg-semantic-background-action-primary px-7">
        <Link
          className="flex items-center gap-2 h-10"
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
      </div>
      <div className="flex h-14 items-center border-b border-solid border-semantic-border-default bg-semantic-background-page px-7">
        <HeaderNav />
      </div>
    </DSHeader>
  );
};
