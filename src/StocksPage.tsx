import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Box, CircularProgress } from "@mui/material";

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

  return number === null ? "-" : number.toFixed(2);
};

const formatPercent = (value: unknown) => {
  const number = parseNumber(value);

  return number === null ? "-" : `${number.toFixed(2)}%`;
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
  { field: "ticker", headerName: "Ticker", flex: 1 },
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
    valueFormatter: formatNumber,
  },
];

const hiddenColumns = {
  sector_sub: false,
  segment: false,
};

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <Box sx={{ height: "calc(100vh - 64px)", p: 2, boxSizing: "border-box" }}>
      <Box sx={{ height: "100%" }}>
        <DataGrid
          rows={stocks}
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