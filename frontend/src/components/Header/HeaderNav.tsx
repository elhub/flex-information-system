import { NavLink } from "react-router-dom";
import { Nav } from "../ui";

const navLinks = [
  { label: "Dashboard", to: "/" },
  { label: "Controllable Units", to: "/controllable_unit" },
  { label: "Service providing groups", to: "/service_providing_group" },
];

export const HeaderNav = () => {
  return (
    <Nav className="flex h-full items-center">
      <div className="flex h-full items-center gap-6">
        {navLinks.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={false}
            className={({ isActive }: { isActive: boolean }) =>
              [
                "relative flex h-full items-center no-underline",
                "text-sm font-bold text-semantic-text-default",
                "after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full",
                isActive
                  ? "after:bg-[var(--eds-semantic-background-action-primary-active)]"
                  : "after:bg-transparent",
              ].join(" ")
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </Nav>
  );
};
