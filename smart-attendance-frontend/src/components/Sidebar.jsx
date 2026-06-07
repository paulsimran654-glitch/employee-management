import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth-context";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", match: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/employees", match: "employees", label: "Employees", icon: Users },
  { to: "/admin/attendance", match: "attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/leaves", match: "leaves", label: "Leave Management", icon: ClipboardList },
  { to: "/admin/leave-balance", match: "leave-balance", label: "Leave Balance", icon: WalletCards },
  { to: "/admin/settings", match: "settings", label: "Settings", icon: Settings },
  { to: "/admin/reports", match: "reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`icon-button sidebar-toggle fixed z-50 lg:hidden ${isOpen ? "sidebar-toggle-open" : ""}`}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[#16123a]/35 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`glass-nav fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between p-4 transition-transform duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="mb-6 flex items-center gap-3 px-2 pt-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-[#6d28d9] shadow-[0_12px_30px_rgba(124,58,237,0.18)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-lg font-black text-[#16123a]">Attendify</p>
              <p className="text-xs font-semibold text-[#635f86]">Admin workspace</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.includes(item.match);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-w-0 items-center gap-3 rounded-[8px] px-3 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-[#6d28d9] text-white shadow-[0_12px_28px_rgba(109,40,217,0.24)]"
                      : "text-[#3b3563] hover:bg-white/70"
                  }`}
                >
                  <Icon className="shrink-0" size={18} />
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-[8px] border border-white/70 bg-white/55 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#ede9fe] font-black text-[#5b21b6]">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#16123a]">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs font-semibold capitalize text-[#635f86]">
                {user?.role || "admin"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger w-full justify-start"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
