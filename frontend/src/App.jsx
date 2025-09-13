// src/App.jsx
import { Routes, Route } from "react-router-dom";

// Top navigation bar
import TopBar from "./components/ui/TopBar";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// App (farmer portal) pages
import Dashboard from "./pages/Dashboard";
import FieldsList from "./pages/FieldsList";
import FieldFormNew from "./pages/FieldFormNew";
import FieldDetail from "./pages/FieldDetail";
import CropPlan from "./pages/CropPlan";
import MarketPrices from "./pages/MarketPrices";
import AdvisoryFeed from "./pages/AdvisoryFeed";
import SoilHealth from "./pages/SoilHealth";
import ScoutingLogs from "./pages/ScoutingLogs";
import Inventory from "./pages/inventory";  // lowercase in your structure
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SyncCenter from "./pages/SyncCenter";
import DiseaseDetect from "./pages/DiseaseDetect";
import Chat from "./pages/Chat";

// Utility / error pages
import Offline from "./pages/Offline";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100">
      {/* Top navigation bar */}
      <TopBar />

      {/* Routes */}
      <Routes>
        {/* Public / marketing */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Farmer portal */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fields" element={<FieldsList />} />
        <Route path="/fields/new" element={<FieldFormNew />} />
        <Route path="/fields/:id" element={<FieldDetail />} />
        <Route path="/plan" element={<CropPlan />} />
        <Route path="/markets" element={<MarketPrices />} />
        <Route path="/advisory" element={<AdvisoryFeed />} />
        <Route path="/soil" element={<SoilHealth />} />
        <Route path="/scouting" element={<ScoutingLogs />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sync" element={<SyncCenter />} />
        <Route path="/diseasedetect" element={<DiseaseDetect />} />
        <Route path="/chat" element={<Chat />} />


        {/* System / fallback */}
        <Route path="/offline" element={<Offline />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
