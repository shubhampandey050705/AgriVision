import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "../utils/auth";

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAuthPage = pathname.startsWith("/auth");

  const [user, setUser] = useState(() => getUser()); // read once at mount

  useEffect(() => {
    const onAuthChanged = () => setUser(getUser());
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  const handleLogout = () => {
    clearUser();
    navigate("/"); // or window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-md" />
            <span className="text-lg font-semibold tracking-tight">
              Agri<span className="text-emerald-400">Vision</span>
            </span>
          </Link>

          {/* Middle nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({isActive}) => isActive ? "text-emerald-500" : ""}>
              Home
            </NavLink>
            <NavLink to="/advisory" className={({isActive}) => isActive ? "text-emerald-500" : ""}>
              Advisory
            </NavLink>
            <NavLink to="/disease" className={({isActive}) => isActive ? "text-emerald-500" : ""}>
              Disease
            </NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <ProfileMenu user={user} onLogout={handleLogout} />
            ) : !isAuthPage ? (
              <>
                <NavLink to="/auth/register" className="text-sm hover:underline">Register</NavLink>
                <NavLink to="/auth/login" className="text-sm hover:underline">Login</NavLink>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({ user, onLogout }) {
  // simple menu without headless UI deps
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl px-3 py-1.5 bg-emerald-500 text-white"
      >
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-6 h-6 rounded-full"
        />
        <span className="text-sm">{user.name?.split(" ")[0] || "Profile"}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow-lg dark:bg-neutral-900"
          onMouseLeave={() => setOpen(false)}
        >
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => { setOpen(false); onLogout(); }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
