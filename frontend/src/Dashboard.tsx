import { Card, CardContent, CardHeader } from "@mui/material";
import { Title, Toolbar, useAuthenticated } from "react-admin";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { apiURL, authURL, serverURL } from "./httpConfig";

export const Dashboard = () => {
  useAuthenticated();
  return (
    <div id="flex-dashboard">
      <Toolbar>
        <Title title="Dashboard" />
      </Toolbar>
      <Card>
        <CardHeader title="Welcome to the Flexibility Information System" />
        <CardContent>
          <p>
            Use the menu on the left to list, view, create and update resources.
          </p>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            The Flexibility Information System is a prototype. As such, even
            though it offers authentication and authorisation features, it
            should <i>not</i> be considered as a production-level system. Please
            make sure the data used while testing is <i>fictitious</i> and does
            not contain <i>any</i> sensitive information.
            <br />
            <br />
            As a test system, it is also subject to frequent updates, and
            therefore, server resets. Please keep in mind that the data inserted
            into the system may be lost at any time.
          </Alert>
          <p>
            Check the{" "}
            <a href={`${serverURL}/docs/tutorials/getting-started`}>tutorial</a>{" "}
            to get started.
          </p>

          <p>Here are some other resources that you might be interested in:</p>

          <ul>
            <li>
              <a href={`${serverURL}/docs`}>Documentation</a>
            </li>
            <li>
              <a href={apiURL}>Main API documentation</a>
            </li>
            <li>
              <a href={authURL}>Auth API documentation</a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
