import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { AlertTriangle, CheckCircle, Clock, Users, XCircle } from "lucide-react";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

axios.defaults.withCredentials = true;

const statusClass = (status) => {
  if (status === "present") return "status-badge status-present";
  if (status === "late") return "status-badge status-late";
  return "status-badge status-absent";
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const usersRes = await axios.get(API_ENDPOINTS.ADMIN_USERS);
        const totalEmployees = usersRes.data.length;

        const attendanceRes = await axios.get(API_ENDPOINTS.ADMIN_ATTENDANCE);

        const today = new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });

        const todayRecords = attendanceRes.data.filter((r) => r.dateString === today);

        let present = 0;
        let absent = 0;
        let late = 0;

        todayRecords.forEach((r) => {
          if (r.status === "present") present++;
          else if (r.status === "late") late++;
          else if (r.status === "absent") absent++;
        });

        setStats({
          total: totalEmployees,
          present,
          absent,
          late,
        });

        const activityData = todayRecords
          .filter((r) => r.checkIn)
          .map((r) => ({
            name: r.employee?.name || "Employee",
            employeeId: r.employeeId || "",
            time: r.checkIn,
            status: r.status,
          }))
          .sort((a, b) => {
            const timeA = a.time.split(":").map(Number);
            const timeB = b.time.split(":").map(Number);
            return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
          });

        setActivity(activityData);

        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const weeklyData = [];
        const todayDate = new Date();
        const day = todayDate.getDay();
        const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(todayDate.setDate(diff));

        for (let i = 0; i < 5; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);

          const dateStr = d.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          });

          const records = attendanceRes.data.filter((r) => r.dateString === dateStr);

          let p = 0;
          let l = 0;
          let a = 0;

          records.forEach((r) => {
            if (r.status === "present") p++;
            else if (r.status === "late") l++;
            else if (r.status === "absent") a++;
          });

          weeklyData.push({
            day: weekDays[i],
            present: p,
            late: l,
            absent: a,
          });
        }

        setChartData(weeklyData);

        const predictionRes = await axios.get(API_ENDPOINTS.ATTENDANCE_PREDICTIONS);
        const highRisk = predictionRes.data.filter((p) => p.risk === "High");
        setPredictions(highRisk);
      } catch (err) {
        console.error("Admin Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel-strong p-6 text-sm font-bold text-[#635f86]">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="page-kicker mb-3">
            <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
            Today
          </p>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle mt-2">Overview of today's attendance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Employees" value={stats.total} icon={Users} color="bg-[#ede9fe] text-[#6d28d9]" />
        <StatCard title="Present Today" value={stats.present} icon={CheckCircle} color="bg-green-100 text-green-700" />
        <StatCard title="Absent Today" value={stats.absent} icon={XCircle} color="bg-red-100 text-red-700" />
        <StatCard title="Late Today" value={stats.late} icon={Clock} color="bg-amber-100 text-amber-700" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="glass-panel-strong p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="section-title">Weekly Attendance</h3>
            <span className="status-badge status-info">Mon to Fri</span>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#817aa3" tickLine={false} axisLine={false} />
                <YAxis stroke="#817aa3" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(124,58,237,0.08)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(125,105,190,0.2)",
                    boxShadow: "0 16px 36px rgba(47,33,92,0.14)",
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="late" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="glass-panel-strong p-5">
            <h3 className="section-title mb-4">Today's Activity</h3>

            <div className="space-y-3">
              {activity.length > 0 ? (
                activity.map((item, i) => (
                  <div key={`${item.employeeId}-${i}`} className="flex items-center justify-between gap-4 rounded-[8px] border border-white/70 bg-white/52 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#16123a]">{item.name}</p>
                      <p className="text-xs font-semibold text-[#817aa3]">
                        {item.employeeId && `${item.employeeId} | `}
                        Checked in at {item.time}
                      </p>
                    </div>

                    <span className={statusClass(item.status)}>{item.status}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No check-ins today</p>
              )}
            </div>
          </section>

          <section className="glass-panel-strong p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={20} />
              <h3 className="section-title">Irregular Attendance</h3>
            </div>

            <div className="space-y-3">
              {predictions.length > 0 ? (
                predictions.map((emp, i) => (
                  <div key={`${emp.name}-${i}`} className="flex items-center justify-between gap-4 rounded-[8px] border border-white/70 bg-white/52 p-3">
                    <div>
                      <p className="text-sm font-black text-[#16123a]">{emp.name}</p>
                      <p className="text-xs font-semibold text-[#817aa3]">
                        Late: {emp.lateCount} | Absent: {emp.absentCount}
                      </p>
                    </div>

                    <span className="status-badge status-danger">High</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No irregular attendance</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;
