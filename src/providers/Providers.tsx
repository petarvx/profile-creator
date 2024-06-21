"use client";

import { StyledEngineProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "react-query";
import { PandaProvider } from "panda-wallet-provider";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PropsWithChildren } from "react";

const primary = "#deff00";
const secondary = "#76FFB6";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: primary },
    secondary: { main: secondary },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ ownerState }) => ({
          fontSize: 18,
          borderRadius: 0,
          borderWidth: 2,
          borderColor: ownerState.color === "secondary" ? secondary : primary,

          ":hover": {
            borderWidth: 2,
            color: "black",
            background: ownerState.color === "secondary" ? secondary : primary,
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        InputProps: {
          sx: {
            borderRadius: 0,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={darkTheme}>
        <QueryClientProvider client={queryClient}>
          <PandaProvider>
            <CssBaseline />
            {children}
          </PandaProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
