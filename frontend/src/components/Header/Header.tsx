import { Link } from "../ui";
import { Link as NavLink } from "react-router-dom";

import styles from "./header.module.css";
import UserDropdown from "./UserDropdown";
import { Header as DSHeader } from "../ui";
export const Header = () => {
  return (
    <DSHeader className={styles.topBar}>
      <Link className={styles.logo} as={NavLink} to={"/"} aria-label="My page">
        <img height={38} src="/static-assets/logo.svg" alt="Euroflex logo" />
      </Link>
      <UserDropdown />
    </DSHeader>
  );
};
