import {
  Avatar,
  Button,
  Card,
  CardActions,
  Typography,
  Stack,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { Form, useRedirect } from "react-admin";
import { Link } from "react-router-dom";
import { authURL, userGuideURL, userGuideCreateUsersURL } from "./httpConfig";

import Box from "@mui/material/Box";

export const LoginPage = () => {
  const redirect = useRedirect();
  const startLogin = async () => {
    redirect(`${authURL}/login`);
  };

  return (
    <Form onSubmit={startLogin} noValidate>
      <Box
        sx={() => ({
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "flex-start",
          background: `linear-gradient(180deg, var(--eds-semantic-background-action-primary) 25%, #ffffff 100%)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        })}
      >
        <Card sx={{ maxWidth: 400, marginTop: "6em" }}>
          <Stack spacing={2} sx={{ margin: "1em" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                alt="EuroFlex logo"
                src="/static-assets/icon.svg"
                style={{ width: 150 }}
              />
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  marginTop: "1em",
                  marginBottom: "0.5em",
                }}
              >
                <LockIcon />
              </Avatar>
            </Box>
            <Typography textAlign={"center"}>
              Sign in to the flexibility register
            </Typography>
            <Box textAlign={"center"} fontSize="0.8em" color="text.primary">
              The flexibility register is the central platform for service
              providers and system operators to exchange information about
              controllable units and service providing groups, and to carry out
              the prequalification of these flexible resources.
            </Box>
            <Box textAlign={"center"} fontSize="0.8em" color="text.secondary">
              This page stores strictly necessary cookies in your browser when
              you use it. Read about what we store in our{" "}
              <Link className="underline" to="/privacy-policy">
                privacy policy
              </Link>
              .
            </Box>
            <CardActions>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                fullWidth
              >
                Sign in
              </Button>
            </CardActions>
            {userGuideURL && (
              <Typography
                textAlign={"center"}
                fontSize="0.8em"
                color="text.secondary"
              >
                <a
                  href={userGuideURL}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  User guide
                </a>
              </Typography>
            )}
            {userGuideCreateUsersURL && (
              <Typography
                textAlign={"center"}
                fontSize="0.8em"
                color="text.secondary"
              >
                <a
                  className="underline"
                  href={userGuideCreateUsersURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  User guide for creating users
                </a>
              </Typography>
            )}
            <Typography
              textAlign={"center"}
              fontSize="0.8em"
              color="text.secondary"
            >
              Made with 💚 by{" "}
              <a
                className="underline"
                href="https://www.elhub.no/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Elhub
              </a>
            </Typography>
          </Stack>
        </Card>
      </Box>
    </Form>
  );
};
