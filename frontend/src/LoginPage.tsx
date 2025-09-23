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
import { authURL, docsURL } from "./httpConfig";

import Box from "@mui/material/Box";

export const LoginPage = () => {
  const redirect = useRedirect();
  const startLogin = async () => {
    redirect(`${authURL}/login`);
  };

  return (
    <Form onSubmit={startLogin} noValidate>
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "flex-start",
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 25%, ${theme.palette.common.white} 100%)`,
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
                src="/euroflex_logo.png"
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
              Sign in to the Flexibility Information System
            </Typography>
            <Box textAlign={"center"} fontSize="0.8em" color="text.secondary">
              This page stores strictly neccessary cookies in your browser when
              you use it. Read about what we store in{" "}
              <a href="https://elhub.github.io/flex-information-system/privacy/">
                our documentation
              </a>
              .
            </Box>
            <CardActions sx={{ padding: "0 1em 1em 1em" }}>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                fullWidth
              >
                Sign in
              </Button>
            </CardActions>
            <Typography
              textAlign={"center"}
              fontSize="0.8em"
              color="text.secondary"
            >
              <a href={`${docsURL}/privacy/`}>Privacy and cookies</a>
            </Typography>
          </Stack>
        </Card>
      </Box>
    </Form>
  );
};
