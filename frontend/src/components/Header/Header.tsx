import UserDropdown from "./UserDropdown";
import { Header as DSHeader } from "../ui";
import { HeaderNav } from "./HeaderNav";
import { NavLink } from "react-router-dom";
import { Link } from "../ui";
import { IconAlarmBell } from "@elhub/ds-icons";
import { usePermissions, useTranslate } from "ra-core";
import { useUnacknowledgedComments } from "../../notification/useUnacknowledgedComments";
import { Permissions } from "../../auth/permissions";

export const Header = () => {
  const translate = useTranslate();
  const { permissions } = usePermissions<Permissions>();
  const canReadNotification = !!permissions?.allow("notification", "read");
  const { count: unacknowledgedCount } = useUnacknowledgedComments({
    enabled: canReadNotification,
  });

  return (
    <DSHeader className="w-full p-0 print:hidden">
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
        <div className="flex items-center gap-2">
          {canReadNotification && (
            <NavLink
              to="/notification"
              aria-label={translate("text.header_nav_notifications")}
              title={translate("text.header_nav_notifications")}
              className="flex h-10 w-10 items-center justify-center rounded text-semantic-background hover:bg-white/10"
            >
              <span className="relative flex">
                <IconAlarmBell />
                {unacknowledgedCount > 0 && (
                  <span
                    data-testid="notification-bell-dot"
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-semantic-background-action-primary bg-semantic-background-error-alternative"
                  />
                )}
              </span>
            </NavLink>
          )}
          <UserDropdown />
        </div>
      </div>
      <div className="flex h-14 items-center border-b border-solid border-semantic-border-default bg-semantic-background-page px-7">
        <HeaderNav />
      </div>
    </DSHeader>
  );
};
