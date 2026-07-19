import { useEffect, useState } from "react";

import axios from "axios";

import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";

import {
  PlayArrow,
  Refresh,
  Analytics,
  TrendingUp,
  Apartment,
  Autorenew,
  CheckCircle,
} from "@mui/icons-material";

import ActionCard from "./ActionCard"

function App() {
  const [backendRunning, setBackendRunning] = useState(false);
  const [backendOperation, setBackendOperation] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/status");

        if (data.running) {
          setBackendRunning(true);
          setBackendOperation(data.operation);
          setShowStatus(true);
        } else {
          if (backendRunning) {
            setBackendRunning(false);
            setBackendOperation(null);

            setTimeout(() => {
              setShowStatus(false);
            }, 5000);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [backendRunning]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold" }}
          >
            AlphaLens
          </Typography>

          <Typography
            variant="caption"
            sx={{
              ml: 1,
              opacity: 0.7,
            }}
          >
            v1.0
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          py: 4,
        }}
      >
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold" }}
          gutterBottom
        >
          Welcome
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Select what you want to analyze
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <ActionCard
            title="Stocks"
            description="Analyze stocks metrics"
            icon={<TrendingUp sx={{ fontSize: 70 }} />}
            color="primary.main"
            disabled={backendRunning}
            onClick={() => console.log("Stocks")}
          />

          <ActionCard
            title="REITs"
            description="Analyze REITs metrics"
            icon={<Apartment sx={{ fontSize: 70 }} />}
            color="success.main"
            disabled={backendRunning}
            onClick={() => console.log("REITs")}
          />
        </Box>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mt: 3, mb: 3 }}
        >
          Select which server task to run
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            justifyContent: "center",
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          <ActionCard
            title="Run scraping"
            description="Scrape the latest data"
            icon={<PlayArrow sx={{ fontSize: 70 }} />}
            color="primary.main"
            disabled={backendRunning}
            onClick={async () => {
              await axios.post("http://localhost:8000/scrape");
              setBackendRunning(true);
              setBackendOperation("scraper");
              setShowStatus(true);
            }}
          />

          <ActionCard
            title="Update prices"
            description="Update current prices"
            icon={<Refresh sx={{ fontSize: 70 }} />}
            color="warning.main"
            disabled={backendRunning}
            onClick={async () => {
              await axios.post("http://localhost:8000/update_prices");
              setBackendRunning(true);
              setBackendOperation("update prices");
              setShowStatus(true);
            }}
          />

          <ActionCard
            title="Run analysis"
            description="Process metrics"
            icon={<Analytics sx={{ fontSize: 70 }} />}
            color="success.main"
            disabled={backendRunning}
            onClick={async () => {
              await axios.post("http://localhost:8000/analysis");
              setBackendRunning(true);
              setBackendOperation("analysis");
              setShowStatus(true);
            }}
          />
        </Box>
      </Container>
      {showStatus && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 4,
            zIndex: 2000,
          }}
        >
          {backendRunning ? (
            <>
              <Autorenew
                sx={{
                  color: "warning.main",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                  },
                }}
              />

              <Typography color="warning.main">
                Running {backendOperation}...
              </Typography>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={async () => {
                  try {
                    await axios.post("http://localhost:8000/cancel");
                    setBackendRunning(false);
                    setBackendOperation(null);
                    setTimeout(() => {
                      setShowStatus(false);
                    }, 5000);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <CheckCircle color="success" />

              <Typography color="success.main">
                Finished
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

export default App;