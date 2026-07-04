import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/transactions", label: "Transactions" },
    { to: "/budgets", label: "Budgets" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-ink text-paper-soft">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <span className="font-display text-xl tracking-wide">BudgetIQ</span>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-body text-sm px-3 py-2 rounded-sm transition-colors ${
                    isActive ? "bg-ink-light text-gold" : "text-paper-line hover:text-paper-soft"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-8 h-8 flex items-center justify-center rounded-sm border border-ink-light hover:bg-ink-light transition-colors text-sm"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <span className="font-mono text-xs text-paper-line hidden sm:inline">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="font-body text-sm border border-ink-light px-3 py-1.5 rounded-sm hover:bg-ink-light transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
