import type { ReactNode } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  variant?: "vertical" | "horizontal";
  width?: number | string;
  selected?: boolean;
}

export default function ActionCard({
  title,
  description,
  icon,
  onClick,
  color = "primary.main",
  disabled = false,
  variant = "vertical",
  width = 300,
  selected = false
}: ActionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        width,
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "primary.main" : "background.paper",
        color: selected ? "primary.contrastText" : "text.primary",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <CardActionArea
        disabled={disabled}
        onClick={onClick}
        sx={{
          p: variant === "vertical" ? 4 : 2,
          height: "100%",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {variant === "vertical" ? (
            <>
              <Box
                sx={{
                  color,
                  mb: 2,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {icon}
              </Box>

              <Typography
                variant="h5"
                gutterBottom
              >
                {title}
              </Typography>

              <Typography color="text.secondary">
                {description}
              </Typography>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    color: selected ? "inherit" : color,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {icon}
                </Box>

                <Typography variant="h6">
                  {title}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {description}
              </Typography>
            </>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}