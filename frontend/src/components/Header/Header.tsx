import UserDropdown from "./UserDropdown";
import { Header as DSHeader } from "../ui";
import { HeaderNav } from "./HeaderNav";

export const Header = () => {
  return (
    <DSHeader className="fixed top-0 z-modal w-full p-0">
      <div className="flex h-12 items-center justify-between bg-semantic-background-action-primary px-14">
        <div className="h-7 w-[68px] opacity-0" aria-hidden>
          placeholder
        </div>
        <UserDropdown />
      </div>
      <div className="flex h-14 items-center border-b border-solid border-semantic-border-default bg-semantic-background-page px-14">
        <HeaderNav />
      </div>
    </DSHeader>
  );
};
