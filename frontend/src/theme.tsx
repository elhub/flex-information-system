import { defaultLightTheme } from "react-admin";

const darkGreen = "#0b3c28";
const lightGreen = "#d6e4d5";
const grey = "#f6f6f6";
const orange = "rgba(213, 128, 0, 1)";

const darkColor =
  window.env.VITE_FLEX_COLOR_DARK ??
  import.meta.env.VITE_FLEX_COLOR_DARK ??
  darkGreen;

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
      main: darkColor,
      contrastText: lightGreen,
    },
    secondary: {
      main: darkColor,
      contrastText: lightGreen,
    },
    error: {
      main: orange,
    },
  },
};
