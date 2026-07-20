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
    headerName: "DY Avg",
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
          variant="horizontal"
          width="100%"
          title="Bazin"
          description="Stocks below ceiling price"
          icon={<Savings fontSize="small" />}
          color="success.main"
          onClick={() => {}}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Graham"
          description="Stocks below fair price"
          icon={<LocalOffer fontSize="small" />}
          color="warning.main"
          onClick={() => {}}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Lynch"
          description="Best growing stocks"
          icon={<TrendingUp fontSize="small" />}
          color="info.main"
          onClick={() => {}}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
          title="Greenblatt"
          description="Best ranked stocks"
          icon={<Leaderboard fontSize="small" />}
          color="primary.main"
          onClick={() => {}}
        />

        <ActionCard
          variant="horizontal"
          width="100%"
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