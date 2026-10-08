import { Form, useRedirect } from "react-admin";
import { Link } from "react-router-dom";
import { authURL, userGuideURL, userGuideCreateUsersURL } from "./httpConfig";
import { Button, Card, CardContent } from "./components/ui";
import { LockIcon } from "./components/icons/LockIcon";
import { darkColor } from "./theme";

const smallText = "text-center text-[0.8em] text-black/60";
const externalLink = {
  className: "underline",
  target: "_blank",
  rel: "noopener noreferrer",
};

export const LoginPage = () => {
  const redirect = useRedirect();
  const startLogin = async () => {
    redirect(`${authURL}/login`);
  };

  return (
    <Form onSubmit={startLogin} noValidate>
      <div className="flex min-h-screen flex-col items-center justify-start bg-no-repeat bg-cover bg-[linear-gradient(180deg,var(--eds-semantic-background-action-primary)_25%,#ffffff_100%)]">
        <Card className="mt-24 max-w-[400px]">
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <img
                alt="EuroFlex logo"
                src="/static-assets/icon.svg"
                style={{ width: 150 }}
              />
              <div
                className="mt-4 mb-2 flex size-10 items-center justify-center rounded-full text-[#f6f6f6]"
                style={{ backgroundColor: darkColor }}
              >
                <LockIcon className="size-6" />
              </div>
            </div>
            <p className="text-center text-base text-black/90">
              Sign in to the flexibility register
            </p>
            <div className="text-center text-[0.8em] text-black/90">
              The flexibility register is the central platform for service
              providers and system operators to exchange information about
              controllable units and service providing groups, and to carry out
              the prequalification of these flexible resources.
            </div>
            <div className={smallText}>
              This page stores strictly necessary cookies in your browser when
              you use it. Read about what we store in our{" "}
              <Link className="underline" to="/privacy-policy">
                privacy policy
              </Link>
              .
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Sign in
            </Button>
            {userGuideURL && (
              <p className={smallText}>
                <a href={userGuideURL} {...externalLink}>
                  User guide
                </a>
              </p>
            )}
            {userGuideCreateUsersURL && (
              <p className={smallText}>
                <a href={userGuideCreateUsersURL} {...externalLink}>
                  User guide for creating users
                </a>
              </p>
            )}
            <p className={smallText}>
              Made with 💚 by{" "}
              <a href="https://www.elhub.no/" {...externalLink}>
                Elhub
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
};
