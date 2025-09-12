// src/App.jsx
import { Route, Routes, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TopBar from "./components/TopBar";

// Existing pages
import Dashboard from "./pages/Dashboard";
import DiseaseDetect from "./pages/DiseaseDetect";
import Chat from "./pages/Chat";

// New pages
import Landing from "./pages/Landing";
import FieldsList from "./pages/FieldsList";
import FieldFormNew from "./pages/FieldFormNew";
import FieldDetail from "./pages/FieldDetail";
import CropPlan from "./pages/CropPlan";
import MarketPrices from "./pages/MarketPrices";
import AdvisoryFeed from "./pages/AdvisoryFeed";
import SoilHealth from "./pages/SoilHealth";
import ScoutingLogs from "./pages/ScoutingLogs";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SyncCenter from "./pages/SyncCenter";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Offline from "./pages/Offline";
import NotFound from "./pages/NotFound";

export default function App() {
  const { t } = useTranslation();

  const nav = [
    { to: "/app", label: t("nav.dashboard") },
    { to: "/app/fields", label: "Fields" },
    { to: "/app/markets", label: "Prices" },
    { to: "/app/disease", label: t("nav.disease") },
    { to: "/app/chat", label: t("nav.chat") },
    { to: "/app/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100">
      <TopBar />

      <nav className="container mt-3">
        <ul className="flex gap-2 text-sm">
          {nav.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl border ${
                    isActive
                      ? "bg-brand-500 text-white border-brand-500 shadow-glow"
                      : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/70 dark:hover:bg-neutral-700"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="container py-6">
        <Routes>
          {/* Public / marketing */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* App (farmer portal) */}
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/fields" element={<FieldsList />} />
          <Route path="/app/fields/new" element={<FieldFormNew />} />
          <Route path="/app/fields/:id" element={<FieldDetail />} />
          <Route path="/app/plan" element={<CropPlan />} />
          <Route path="/app/disease" element={<DiseaseDetect />} />
          <Route path="/app/markets" element={<MarketPrices />} />
          <Route path="/app/advisory" element={<AdvisoryFeed />} />
          <Route path="/app/chat" element={<Chat />} />
          <Route path="/app/soil" element={<SoilHealth />} />
          <Route path="/app/scouting" element={<ScoutingLogs />} />
          <Route path="/app/inventory" element={<Inventory />} />
          <Route path="/app/sales" element={<Sales />} />
          <Route path="/app/reports" element={<Reports />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/sync" element={<SyncCenter />} />

          {/* Legacy shortcuts you already had */}
          <Route path="/disease" element={<DiseaseDetect />} />
          <Route path="/chat" element={<Chat />} />

          {/* Offline + errors */}
          <Route path="/offline" element={<Offline />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
