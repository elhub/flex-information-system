import { Avatar, Button, Card, CardActions } from "@mui/material";
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
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "flex-start",
          background:
            "linear-gradient(180deg, rgba(11,60,40,1) 30%, rgba(32,84,58,1) 60%, rgba(87,135,107,1) 80%, rgba(214,228,213,1) 100%)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Card sx={{ minWidth: 300, marginTop: "6em" }}>
          <Box
            sx={{
              margin: "1em",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              alt="EuroFlex logo"
              src="/euroflex_logo.png"
              style={{ width: 150 }}
            />
          </Box>
          <Box
            sx={{
              margin: "1em",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              <LockIcon />
            </Avatar>
          </Box>
          <Box
            sx={{
              margin: "2em",
              display: "flex",
              justifyContent: "center",
              color: (theme) => theme.palette.grey[500],
            }}
          >
            Sign in to the Flexibility Information System
          </Box>
          <CardActions sx={{ padding: "0 1em 1em 1em" }}>
            <Button variant="contained" type="submit" color="primary" fullWidth>
              Sign in
            </Button>
          </CardActions>
          <Box
            sx={{
              margin: "1em",
              display: "flex",
              justifyContent: "center",
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <a href={`${docsURL}/technical/privacy/`}>Privacy and cookies</a>
          </Box>
        </Card>
      </Box>
    </Form>
  );
};
