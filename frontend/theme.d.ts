import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      buttonTextHover: string;
      borderColor: string;
    };
  }

  interface ThemeOptions {
    custom?: {
      buttonTextHover?: string;
      borderColor?: string;
    };
  }
}
