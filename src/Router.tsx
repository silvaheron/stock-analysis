import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./Layout";
import HomePage from "./HomePage";
import StocksPage from "./StocksPage";
import ReitsPage from "./ReitsPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/reits" element={<ReitsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}