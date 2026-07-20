import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DataGrid } from "@mui/x-data-grid";

import type {
  GridColDef,
  GridFilterModel,
  GridSortModel
} from "@mui/x-data-grid";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  Savings,
  LocalOffer,
  TrendingUp,
  Leaderboard,
  CompareArrows,
} from "@mui/icons-material";

import CustomToolbar from "./CustomToolbar"

import axios from "axios";

const parseNumber = (value: unknown): number | null => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-" ||
    value === "-%"
  ) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const normalized = value
    .toString()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace("%", "")
    .trim();

  const number = Number(normalized);

  return isNaN(number) ? null : number;
};

const formatNumber = (value: unknown) => {
  const number = parseNumber(value);

  return number === null
    ? "-"
    : number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const formatPercent = (value: unknown) => {
  const number = parseNumber(value);

  return number === null
    ? "-"
    : `${number.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`;
};

const formatCurrency = (value: unknown) => {
  const number = parseNumber(value);

  if (number === null) {
    return "-";
  }

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const columns: GridColDef[] = [
  {
    field: "ticker",
    headerName: "Ticker",
    flex: 1,
    renderCell: (params) => (
      <a
        href={`https://investidor10.com.br/acoes/${params.value.toLowerCase()}/`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: "none",
        }}
      >
        {params.value}
      </a>
    ),
  },

  { field: "sector", headerName: "Sector", flex: 2 },
  { field: "sector_sub", headerName: "Sub sector", flex: 1 },
  { field: "segment", headerName: "Segment", flex: 1 },

  // Percentages
  {
    field: "dy",
    headerName: "DY",
    type: "number",
    flex: 1,
    valueFormatter: formatPercent,
  },
  {
    field: "dy_avg",
    headerName: "DY Average",
    type: "number",
    flex: 1,
    valueFormatter: formatPercent,
  },
  {
    field: "roe",
    headerName: "ROE",
    type: "number",
    flex: 1,
    valueFormatter: formatPercent,
  },
  {
    field: "roa",
    headerName: "ROA",
    type: "number",
    flex: 1,
    valueFormatter: formatPercent,
  },

  // Ratios
  {
    field: "pl",
    headerName: "P/L",
    type: "number",
    flex: 1,
    valueFormatter: formatNumber,
  },
  {
    field: "pl_avg",
    headerName: "P/L Average",
    type: "number",
    flex: 1,
    valueFormatter: formatNumber,
  },
  {
    field: "pv",
    headerName: "P/VP",
    type: "number",
    flex: 1,
    valueFormatter: formatNumber,
  },
  {
    field: "pv_avg",
    headerName: "P/VP Average",
    type: "number",
    flex: 1,
    valueFormatter: formatNumber,
  },

  // Prices / valuation
  {
    field: "price",
    headerName: "Price",
    type: "number",
    flex: 1,
    valueFormatter: formatCurrency,
  },
  {
    field: "bazin",
    headerName: "Bazin",
    type: "number",
    flex: 1,
    valueFormatter: formatCurrency,
  },
  {
    field: "graham",
    headerName: "Graham",
    type: "number",
    flex: 1,
    valueFormatter: formatCurrency,
  },
  {
    field: "graham_upside",
    headerName: "Upside",
    type: "number",
    flex: 1,
    valueGetter: (_, row) => {
      if (!row.price || !row.graham) return null;

      return ((row.graham / row.price) - 1) * 100;
    },
    valueFormatter: formatPercent,
  },
  {
    field: "lynch",
    headerName: "Lynch",
    type: "number",
    flex: 1,
    valueFormatter: formatNumber,
  },

  // Rankings
  {
    field: "greenblatt_rank",
    headerName: "Rank",
    type: "number",
    flex: 1,
    valueFormatter: (value) => {
      const number = parseNumber(value);
      return number === null ? "-" : number.toFixed(0);
    }
  },
];

const hiddenColumns = {
  sector_sub: false,
  segment: false,
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color?: string;
  onClick: () => void;
}

function ActionCard({
  title,
  description,
  icon,
  color = "primary.main",
  onClick,
}: ActionCardProps) {
  return (
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
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
                color,
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
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/stocks")
      .then(({ data }) => setStocks(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 2,
          mb: 2,
        }}
      >
        <ActionCard
          title="Bazin"
          description="Stocks below ceiling price"
          icon={<Savings fontSize="small" />}
          color="success.main"
          onClick={() => {}}
        />

        <ActionCard
          title="Graham"
          description="Stocks below fair price"
          icon={<LocalOffer fontSize="small" />}
          color="warning.main"
          onClick={() => {}}
        />

        <ActionCard
          title="Lynch"
          description="Best growing stocks"
          icon={<TrendingUp fontSize="small" />}
          color="info.main"
          onClick={() => {}}
        />

        <ActionCard
          title="Greenblatt"
          description="Best ranked stocks"
          icon={<Leaderboard fontSize="small" />}
          color="primary.main"
          onClick={() => {}}
        />

        <ActionCard
          title="Best Averages"
          description="Stocks below averages"
          icon={<CompareArrows fontSize="small" />}
          color="error.main"
          onClick={() => {}}
        />
      </Box>

      <Box sx={{ height: "calc(100% - 110px)" }}>
        <DataGrid
          rows={stocks}
          columns={columns}
          initialState={{
            columns: {
              columnVisibilityModel: hiddenColumns,
            },
          }}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          getRowId={(row) => row.ticker}
          showToolbar
          slots={{
            toolbar: CustomToolbar,
          }}
        />
      </Box>
    </Box>
  );
}