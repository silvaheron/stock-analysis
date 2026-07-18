import {
  AppBar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  PlayArrow,
  Refresh,
  Analytics,
  TrendingUp,
  Apartment,
} from "@mui/icons-material";

function ActionCard({
  title,
  description,
  icon,
  color,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        width: 300,
        textAlign: "center",
      }}
    >
      <CardActionArea
        sx={{
          p: 4,
          height: "100%",
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            color,
            mb: 2,
          }}
        >
          {icon}
        </Box>

        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {title}
          </Typography>

          <Typography color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function App() {
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
            description="Analyze stocks metrics."
            icon={<TrendingUp sx={{ fontSize: 70 }} />}
            color="primary.main"
            onClick={() => console.log("Stocks")}
          />

          <ActionCard
            title="REITs"
            description="Analyze REITs metrics."
            icon={<Apartment sx={{ fontSize: 70 }} />}
            color="success.main"
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
            description="Scrape the latest data."
            icon={<PlayArrow sx={{ fontSize: 70 }} />}
            color="primary.main"
            onClick={() => console.log("Run scraping")}
          />

          <ActionCard
            title="Update prices"
            description="Update current prices."
            icon={<Refresh sx={{ fontSize: 70 }} />}
            color="warning.main"
            onClick={() => console.log("Update prices")}
          />

          <ActionCard
            title="Run analysis"
            description="Process metrics."
            icon={<Analytics sx={{ fontSize: 70 }} />}
            color="success.main"
            onClick={() => console.log("Run analysis")}
          />
        </Box>
      </Container>
    </Box>
  );
}

export default App;