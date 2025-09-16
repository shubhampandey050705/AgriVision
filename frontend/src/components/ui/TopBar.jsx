// src/components/ui/TopBar.jsx
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Leaf, Sprout } from "lucide-react";

import ThemeToggle from "../ThemeToggle";
import LangSelect from "../LangSelect";
import { getUser, clearUser } from "../../utils/auth"; // <-- ensure path

export default function TopBar() {
  const { t } = useTranslation();
  const appName = t("appName", { defaultValue: "AgriVision" });

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAuthPage = pathname.startsWith("/auth");

  // read auth once, then update on events
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    const onAuthChanged = () => setUser(getUser());
    window.addEventListener("auth-changed", onAuthChanged);
    // also react to multi-tab login/logout
    const onStorage = (e) => {
      if (e.key === "auth_user" || e.key === "token") onAuthChanged();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    navigate("/auth/login");
  };

  // Define *public* nav items (always visible)
  const leftNav = [
    { key: "nav.home", path: "/" },
    { key: "nav.dashboard", path: "/dashboard" },
    { key: "nav.fields", path: "/fields" },
    { key: "nav.prices", path: "/markets" },
    { key: "nav.diseaseDetect", path: "/diseasedetect" },
    { key: "nav.assistant", path: "/chat" },
    { key: "nav.settings", path: "/settings" },
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
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2" aria-label={appName}>
          <Sprout className="w-5 h-5 text-emerald-500" />
          <span className="text-lg font-bold tracking-tight">{appName}</span>
          <Leaf className="w-4 h-4 text-emerald-500" />
        </Link>

        {/* Middle nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {leftNav.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "text-emerald-500 font-semibold"
                  : "hover:text-emerald-500 transition-colors"
              }
              end={item.path === "/"}
            >
              {t(item.key)}
            </NavLink>
          ))}

          {/* Auth section (right-aligned but within nav for consistent spacing on md+) */}
          {!user && !isAuthPage && (
            <>
              <NavLink
                to="/auth/login"
                className="hover:text-emerald-500 transition-colors"
              >
                {t("nav.login", { defaultValue: "Login" })}
              </NavLink>
              <NavLink
                to="/auth/register"
                className="hover:text-emerald-500 transition-colors"
              >
                {t("nav.register", { defaultValue: "Register" })}
              </NavLink>
            </>
          )}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <LangSelect />
          <ThemeToggle />

          {/* Mobile auth links */}
          {!user && !isAuthPage && (
            <div className="flex md:hidden items-center gap-3 text-sm">
              <NavLink to="/auth/login" className="hover:underline">
                {t("nav.login", { defaultValue: "Login" })}
              </NavLink>
              <NavLink to="/auth/register" className="hover:underline">
                {t("nav.register", { defaultValue: "Register" })}
              </NavLink>
            </div>
          )}

          {/* Profile menu (visible when logged in) */}
          {user && <ProfileMenu user={user} onLogout={handleLogout} t={t} />}
        </div>
      </div>
    </motion.header>
  );
}

function ProfileMenu({ user, onLogout, t }) {
  const [open, setOpen] = useState(false);
  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] ||
    user?.username ||
    t("nav.profile", { defaultValue: "Profile" });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-emerald-500 text-white"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-6 h-6 rounded-full"
        />
        <span className="text-sm">{firstName}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg dark:bg-neutral-900"
          onMouseLeave={() => setOpen(false)}
          role="menu"
        >
          <NavLink
            to="/profile"
            className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            {t("nav.myProfile", { defaultValue: "My Profile" })}
          </NavLink>
          <NavLink
            to="/settings"
            className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            {t("nav.settings", { defaultValue: "Settings" })}
          </NavLink>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            {t("nav.logout", { defaultValue: "Logout" })}
          </button>
        </div>
      )}
    </div>
  );
}
