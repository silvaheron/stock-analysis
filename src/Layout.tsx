import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            AlphaLens
          </Typography>

          <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
            v1.0
          </Typography>
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
}