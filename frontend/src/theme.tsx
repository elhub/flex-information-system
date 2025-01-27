import { defaultLightTheme } from "react-admin";

const darkGreen = "#0b3c28";
const lightGreen = "#d6e4d5";
const grey = "#f6f6f6";
const orange = "#d58000";

export const elhubTheme = {
  ...defaultLightTheme,
  sidebar: {
    width: 350, // The default value is 240
    closedWidth: 55, // The default value is 55
  },
  palette: {
    ...defaultLightTheme.palette,
    background: {
      default: grey,
    },
    primary: {
      main: darkGreen,
      contrastText: lightGreen,
    },
    secondary: {
      main: darkGreen,
      contrastText: lightGreen,
    },
    error: {
      main: orange,
    },
  },
};
