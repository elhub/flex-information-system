import { Heading, Link } from "../ui";
import { Link as NavLink } from "react-router-dom";

import styles from "./header.module.css";
import UserDropdown from "./UserDropdown";
import { Header as DSHeader } from "../ui";
export const Header = () => {
    return (
        <DSHeader className={styles.topBar}>
            <Link className={styles.logo} as={NavLink} to={"/"} aria-label="My page">
                <img height={30} src="/euroflex_logo.png" alt="Euroflex logo" />
                <Heading level={2} style={{ color: "white" }} size="medium">
                    Fleksibilitetsregisteret
                </Heading>
            </Link>
            <UserDropdown />
        </DSHeader>
    );
};
