import type { ReactNode } from "react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Link2,
  Shirt as ShirtIcon,
  PenSquare,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/private-links", label: "Private Links", icon: Link2 },
  { to: "/admin/designs", label: "Designs", icon: PenSquare },
  { to: "/admin/products", label: "Products", icon: ShirtIcon },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-brown-dark font-display text-sm font-bold">
          A
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-wide text-bg">
            Prime Attaire
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-bg/45">Admin</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-gold/15 text-gold"
                  : "text-bg/65 hover:bg-white/5 hover:text-bg"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-bg/65 transition-colors duration-200 hover:bg-white/5 hover:text-bg"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-brown-dark lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-brown-dark shadow-premium">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/80 px-5 py-4 backdrop-blur-md lg:px-8">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <h1 className="text-base font-semibold text-ink lg:text-lg">{title}</h1>
          <div className="w-9 lg:hidden" />
        </header>

        {(description || actions) && (
          <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            {description && <p className="text-sm text-muted">{description}</p>}
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
