import { createElement, useEffect, useState } from "react";
import { BadgeCheck, Clock3, LogIn, LogOut, TimerReset } from "lucide-react";
import {
  getAttendanceHistory,
  getTodayAttendance,
} from "../api/attendanceApi";

const statusClass = (status) => {
  if (status === "present") return "status-badge status-present";
  if (status === "late") return "status-badge status-late";
  if (status === "absent") return "status-badge status-absent";
  if (status === "on-leave") return "status-badge status-leave";
  return "status-badge bg-gray-100 text-gray-600";
};

const SummaryCard = ({ label, value, icon }) => (
  <div className="metric-card min-h-[120px]">
    <div className="relative z-10 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-[#635f86]">{label}</p>
        <h2 className="mt-2 text-2xl font-black text-[#16123a]">{value}</h2>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#6d28d9]">
        {createElement(icon, { size: 21 })}
      </div>
    </div>
  </div>
);

export default function EmployeeDashboard({ user }) {
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todayData = await getTodayAttendance();
        setData(todayData);

        const records = await getAttendanceHistory();
        if (records.length > 0) {
          setRecent(records[0]);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const [h1, m1] = checkIn.split(":").map(Number);
    const [h2, m2] = checkOut.split(":").map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);

    return (totalMinutes / 60).toFixed(2) + "h";
  };

  if (loading) {
    return (
      <div className="glass-panel-strong p-6 text-sm font-bold text-[#635f86]">
        Loading dashboard...
      </div>
    );
  }

  const primaryMessage = data?.checkOut
    ? "You're done for today"
    : data?.checkIn
    ? "Don't forget to check out"
    : "You haven't checked in";

  const secondaryMessage = data?.checkOut
    ? "See you tomorrow."
    : data?.checkIn
    ? "Complete your day properly."
    : "Please scan the QR to check in.";

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
          Employee
        </p>
        <h1 className="page-title">Hello, {user.name}</h1>
        <p className="page-subtitle mt-2">Here's your attendance summary for today.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Today's Status" value={data?.status || "-"} icon={BadgeCheck} />
        <SummaryCard label="Check In" value={data?.checkIn || "-"} icon={LogIn} />
        <SummaryCard label="Check Out" value={data?.checkOut || "-"} icon={LogOut} />
        <SummaryCard label="Working Hours" value={calculateHours(data?.checkIn, data?.checkOut)} icon={TimerReset} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel-strong flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#6d28d9]">
            <Clock3 size={32} />
          </div>

          <h2 className="text-2xl font-black text-[#16123a]">{primaryMessage}</h2>
          <p className="mt-2 text-sm font-semibold text-[#635f86]">{secondaryMessage}</p>
        </section>

        <section className="glass-panel-strong p-6">
          <h2 className="section-title mb-5">Recent Attendance</h2>

          {recent ? (
            <div className="flex items-center justify-between gap-4 rounded-[8px] border border-white/70 bg-white/55 p-4">
              <div>
                <p className="font-black text-[#16123a]">
                  {new Date(recent.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#635f86]">
                  {recent.checkIn || "-"} - {recent.checkOut || "-"}
                </p>
              </div>

              <span className={statusClass(recent.status)}>
                {recent.status === "on-leave" ? "On Leave" : recent.status}
              </span>
            </div>
          ) : (
            <p className="empty-state">No recent attendance</p>
          )}
        </section>
      </div>
    </div>
  );
}
