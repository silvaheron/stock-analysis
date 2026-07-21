import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";

import type {
  GridColDef,
} from "@mui/x-data-grid";

import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  Savings,
  LocalOffer,
  TrendingUp,
  Leaderboard,
  CompareArrows,
} from "@mui/icons-material";

import {
  parseNumber,
  formatNumber,
  formatPercent,
  formatCurrency,
} from "./utils"

import ActionCard from "./ActionCard"
import CustomToolbar from "./CustomToolbar"

import axios from "axios";

const WEIGHTS = {
  pl: 2,
  pv: 1,
};

const getBelowAverageScore = (stock: any) => {
  const pl = parseNumber(stock.pl);
  const pv = parseNumber(stock.pv);
  
  if (
    pl == null ||
    pv == null ||
    stock.pl_avg == null ||
    stock.pv_avg == null
  ) {
    return null;
  }

  // Ignore companies with negative or zero current/historical P/L
  if (pl <= 0 || stock.pl_avg <= 0) {
    return null;
  }

  let score = 0;

  // Lower P/L than 5Y average
  if (pl < stock.pl_avg) {
    score +=
      WEIGHTS.pl *
      ((stock.pl_avg - pl) / stock.pl_avg);
  }

  // Lower P/VP than 5Y average
  if (
    pv > 0 &&
    stock.pv_avg > 0 &&
    pv < stock.pv_avg
  ) {
    score +=
      WEIGHTS.pv *
      ((stock.pv_avg - pv) / stock.pv_avg);
  }

  return score;
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
  {
    field: "dy",
    headerName: "DY",
    type: "number",
    flex: 1,
    valueFormatter: formatPercent,
  },
  {
    field: "dy_avg",
    headerName: "DY Avg",
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
    headerName: "P/L Avg",
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
    headerName: "P/VP Avg",
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

type FilterMode =
  | "all"
  | "bazin"
  | "graham"
  | "lynch"
  | "greenblatt"
  | "averages";

export default function StocksPage() {
  const [loading, setLoading] = useState(true);
  
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");

  const toggleFilter = (newFilter: FilterMode) => {
    setFilter((current) =>
      current === newFilter ? "all" : newFilter
    );
  };

  const displayedRows = useMemo(() => {
    switch (filter) {
      case "bazin":
        return rows
          .filter(
            (stock) =>
              stock.price != null &&
              stock.bazin != null &&
              stock.price < stock.bazin
          )
          .sort((a, b) => {
            const diffA = a.bazin - a.price;
            const diffB = b.bazin - b.price;
            return diffB - diffA;
          });

      case "graham":
        return rows
          .filter(
            (stock) =>
              stock.price != null &&
              stock.graham != null &&
              stock.price < stock.graham
          )
          .sort((a, b) => {
            const upsideA = (a.graham / a.price) - 1;
            const upsideB = (b.graham / b.price) - 1;
            return upsideB - upsideA;
          });

      case "lynch":
        return rows
          .filter(
            (stock) =>
              stock.lynch != null &&
              stock.lynch > 1
          )
          .sort((a, b) => b.lynch - a.lynch);

      case "greenblatt":
        return rows
          .filter(
            (stock) =>
              stock.greenblatt_rank != null
          )
          .sort((a, b) => a.greenblatt_rank - b.greenblatt_rank);

      case "averages":
        return rows
          .map((stock) => ({
            stock,
            score: getBelowAverageScore(stock),
          }))
          .filter(({ score }) => score != null && score > 0)
          .sort((a, b) => b.score! - a.score!)
          .map(({ stock }) => stock);
      
      default:
        return rows;
    }
  }, [rows, filter]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/stocks")
      .then(({ data }) => setRows(data))
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
          variant="horizontal"
          width="100%"
          title="Bazin"
          description="Stocks below ceiling price"
          icon={<Savings fontSize="small" />}
          color="success.main"
          selected={filter === "bazin"}
          onClick={() => toggleFilter("bazin")}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Graham"
          description="Stocks below fair price"
          icon={<LocalOffer fontSize="small" />}
          color="warning.main"
          selected={filter === "graham"}
          onClick={() => toggleFilter("graham")}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Lynch"
          description="Best growing stocks"
          icon={<TrendingUp fontSize="small" />}
          color="info.main"
          selected={filter === "lynch"}
          onClick={() => toggleFilter("lynch")}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Greenblatt"
          description="Best ranked stocks"
          icon={<Leaderboard fontSize="small" />}
          selected={filter === "greenblatt"}
          onClick={() => toggleFilter("greenblatt")}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Best Averages"
          description="Stocks below averages"
          icon={<CompareArrows fontSize="small" />}
          color="error.main"
          selected={filter === "averages"}
          onClick={() => toggleFilter("averages")}
        />
      </Box>

      <Box sx={{ height: "calc(100% - 110px)" }}>
        <DataGrid
          rows={displayedRows}
          columns={columns}
          initialState={{
            columns: {
              columnVisibilityModel: hiddenColumns,
            },
          }}
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