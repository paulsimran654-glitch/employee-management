import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, UserRoundCheck } from "lucide-react";
import { AuthContext } from "../context/auth-context";

const titles = {
  dashboard: ["Dashboard", "Your attendance snapshot for today"],
  scan: ["Scan QR", "Mark attendance securely with QR and location"],
  history: ["History", "Review your attendance timeline"],
  leaves: ["My Leaves", "Apply and track leave requests"],
  report: ["My Report", "Download your attendance summary"],
};

export default function EmployeeTopbar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const current = Object.keys(titles).find((key) => location.pathname.includes(key));
  const [title, subtitle] = titles[current] || titles.dashboard;

  return (
    <header className="glass-panel-strong sticky top-0 z-20 mx-4 mt-4 flex min-h-16 items-center justify-between gap-4 px-4 py-3 lg:mx-0 lg:mt-0">
      <div className="min-w-0 pl-12 lg:pl-0">
        <h1 className="truncate text-base font-black text-[#16123a] sm:text-lg">
          {title}
        </h1>
        <p className="hidden text-xs font-semibold text-[#635f86] sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-2 rounded-[8px] border border-[#7d69be2e] bg-white/55 px-3 py-2 text-xs font-bold text-[#635f86] md:flex">
          <CalendarDays className="shrink-0" size={15} />
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        <div className="flex items-center gap-3 rounded-[8px] border border-white/70 bg-white/60 px-2.5 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#ede9fe] font-black text-[#6d28d9]">
            {user?.name?.charAt(0)?.toUpperCase() || <UserRoundCheck className="shrink-0" size={18} />}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-black text-[#16123a]">
              {user?.name || "Employee"}
            </p>
            <p className="text-xs font-semibold text-[#635f86]">
              {user?.department || "Employee portal"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
