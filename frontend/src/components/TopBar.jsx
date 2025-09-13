// src/components/ui/TopBar.jsx
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Leaf, Sprout } from "lucide-react";

// TopBar is inside /components/ui → go up one level for these:
import ThemeToggle from "../ThemeToggle";
import LangSelect from "../LangSelect";

export default function TopBar() {
  const { t } = useTranslation();
  const appName = t("appName", { defaultValue: "AgriVision" });
    const navItems = [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Fields", path: "/fields" },
      { name: "Prices", path: "/markets" },
      { name: "Disease Detect", path: "/diseasedetect" }, // matches your App.jsx
      { name: "Assistant", path: "/chat" },               // must match route
      { name: "Settings", path: "/settings" },
      { name: "Login", path: "/auth/login" },
      { name: "Register", path: "/auth/register" },
    ];

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full border-b border-neutral-200/70 
                 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-950/50 
                 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-semibold tracking-tight">{appName}</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-emerald-500 font-semibold"
                    : "hover:text-emerald-500 transition-colors"
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <LangSelect />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
