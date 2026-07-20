import {
  Toolbar,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
} from "@mui/x-data-grid";

import {
  Button,
} from "@mui/material";

import {
  ViewColumn,
  FilterList,
} from "@mui/icons-material";

export default function CustomToolbar() {
  return (
    <Toolbar>
      <ColumnsPanelTrigger
        render={(props) => (
          <Button
            {...props}
            startIcon={<ViewColumn fontSize="small" />}
            sx={{
              lineHeight: 1,
              "& .MuiButton-startIcon": {
                marginTop: 0,
              },
            }}
          >
            Columns
          </Button>
        )}
      />

      <FilterPanelTrigger
        render={(props) => (
          <Button
            {...props}
            startIcon={<FilterList fontSize="small" />}
            sx={{
              lineHeight: 1,
              "& .MuiButton-startIcon": {
                marginTop: 0,
              },
            }}
          >
            Filters
          </Button>
        )}
      />
    </Toolbar>
  );
}