import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";
import "./index.css";
import Router from "./Router.tsx";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.075rem"
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  </StrictMode>
);
