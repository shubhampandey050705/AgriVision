// src/components/ui/TopBar.jsx
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Leaf, Sprout } from "lucide-react";

import ThemeToggle from "../ThemeToggle";
import LangSelect from "../LangSelect";

export default function TopBar() {
  const { t } = useTranslation();
  const appName = t("appName", { defaultValue: "AgriVision" });

  // Use translation KEYS, not hardcoded labels
  const navItems = [
    { key: "nav.home", path: "/" },
    { key: "nav.dashboard", path: "/dashboard" },
    { key: "nav.fields", path: "/fields" },
    { key: "nav.prices", path: "/markets" },
    { key: "nav.diseaseDetect", path: "/diseasedetect" },
    { key: "nav.assistant", path: "/chat" },
    { key: "nav.settings", path: "/settings" },
    { key: "nav.login", path: "/auth/login" },
    { key: "nav.register", path: "/auth/register" },
  ];

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 w-full border-b border-neutral-200/70 
                 dark:border-neutral-800/70 bg-white/60 dark:bg-neutral-950/50 
                 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo flush left */}
        <Link to="/" className="flex items-center gap-2" aria-label={appName}>
          <Sprout className="w-5 h-5 text-emerald-500" />
          <span className="text-lg font-bold tracking-tight">{appName}</span>
          <Leaf className="w-4 h-4 text-emerald-500" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "text-emerald-500 font-semibold"
                  : "hover:text-emerald-500 transition-colors"
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <LangSelect />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
