import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";

type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  disabled?: boolean;
};

export default function ActionCard({
  title,
  description,
  icon,
  color,
  onClick,
  disabled = false,
}: ActionCardProps) {
  return (
    <Card
      sx={{
        width: 300,
        textAlign: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <CardActionArea
        disabled={disabled}
        onClick={onClick}
        sx={{
          p: 4,
          height: "100%",
        }}
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