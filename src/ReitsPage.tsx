import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

import type {
  GridColDef,
} from "@mui/x-data-grid";

import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  formatNumber,
  formatPercent,
  formatCurrency,
} from "./utils"

import CustomToolbar from "./CustomToolbar"

import axios from "axios";

const columns: GridColDef[] = [
  {
    field: "ticker",
    headerName: "Ticker",
    flex: 1,
    renderCell: (params) => (
      <a
        href={`https://investidor10.com.br/fiis/${params.value.toLowerCase()}/`}
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

  { field: "sector", headerName: "Sector", flex: 1 },
  { field: "sector_sub", headerName: "Sub sector", flex: 1 },

  {
    field: "liquidity",
    headerName: "Liquidity",
    type: "number",
    flex: 1,
    valueFormatter: formatCurrency,
  },

  {
    field: "dy",
    headerName: "DY",
    type: "number",
    flex: 1,
    valueFormatter: formatPercent,
  },
  {
    field: "pv",
    headerName: "P/VP",
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
    field: "bazin_upside",
    headerName: "Upside",
    type: "number",
    flex: 1,
    valueGetter: (_, row) => {
      if (!row.price || !row.bazin) return null;

      return ((row.bazin / row.price) - 1) * 100;
    },
    valueFormatter: formatPercent,
  },
];

export default function ReitsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/reits")
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
      <Box sx={{ height: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.ticker}
          showToolbar
          slots={{
            toolbar: CustomToolbar,
          }}
        />
      </Box>
    </Box>
  )
}