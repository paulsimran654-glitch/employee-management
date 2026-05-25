import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

axios.defaults.withCredentials = true;

const AdminDashboard = () => {

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0
  });

  const [chartData, setChartData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchDashboard = async () => {
      try {

        // ✅ TOTAL EMPLOYEES
        const usersRes = await axios.get(API_ENDPOINTS.ADMIN_USERS);
        const totalEmployees = usersRes.data.length;

        // ✅ ALL ATTENDANCE (ADMIN)
        const attendanceRes = await axios.get(API_ENDPOINTS.ADMIN_ATTENDANCE);

        // ✅ FIX 1: IST DATE (CRITICAL)
        const today = new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata"
        });

        const todayRecords = attendanceRes.data.filter(
          (r) => r.dateString === today
        );

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
          late
        });

        // ✅ TODAY ACTIVITY - Show actual check-in times
        const activityData = todayRecords
          .filter(r => r.checkIn) // Only show records with check-in time
          .map((r) => ({
            name: r.employee?.name || "Employee",
            employeeId: r.employeeId || "",
            time: r.checkIn, // Actual check-in time from database
            status: r.status
          }))
          .sort((a, b) => {
            // Sort by check-in time (earliest first)
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
          });

        setActivity(activityData);

        // ================= WEEKLY FIX (MON → FRI) =================

        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const weeklyData = [];

        const todayDate = new Date();

        // get Monday
        const day = todayDate.getDay();
        const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1);

        const monday = new Date(todayDate.setDate(diff));

        for (let i = 0; i < 5; i++) {

          const d = new Date(monday);
          d.setDate(monday.getDate() + i);

          const dateStr = d.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata"
          });

          const records = attendanceRes.data.filter(
            (r) => r.dateString === dateStr
          );

          let p = 0, l = 0, a = 0;

          records.forEach((r) => {
            if (r.status === "present") p++;
            else if (r.status === "late") l++;
            else if (r.status === "absent") a++;
          });

          weeklyData.push({
            day: weekDays[i],
            present: p,
            late: l,
            absent: a
          });
        }

        setChartData(weeklyData);

        // ================= AI =================
        const predictionRes = await axios.get(API_ENDPOINTS.ATTENDANCE_PREDICTIONS);

        const highRisk = predictionRes.data.filter(
          (p) => p.risk === "High"
        );

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
    return <div className="p-10">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Overview of today's attendance
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard title="Total Employees" value={stats.total} icon={Users} color="bg-blue-100 text-blue-600" />

        <StatCard title="Present Today" value={stats.present} icon={CheckCircle} color="bg-green-100 text-green-600" />

        <StatCard title="Absent Today" value={stats.absent} icon={XCircle} color="bg-red-100 text-red-600" />

        <StatCard title="Late Today" value={stats.late} icon={Clock} color="bg-orange-100 text-orange-600" />

      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* CHART */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

          <h3 className="font-semibold mb-4">
            Weekly Attendance
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="present" fill="#16a34a" />
              <Bar dataKey="late" fill="#f59e0b" />
              <Bar dataKey="absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* ACTIVITY */}
          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="font-semibold mb-4">
              Today's Activity
            </h3>

            <div className="space-y-4">

              {activity.length > 0 ? activity.map((item, i) => (

                <div key={i} className="flex justify-between items-center">

                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.employeeId && `${item.employeeId} • `}
                      Checked in at {item.time}
                    </p>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full ${
                    item.status === "present"
                      ? "bg-green-100 text-green-600"
                      : item.status === "late"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {item.status}
                  </span>

                </div>

              )) : (
                <p className="text-sm text-gray-500">
                  No check-ins today
                </p>
              )}

            </div>

          </div>

          {/* AI */}
          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="font-semibold mb-4">
              ⚠️ Irregular Attendance
            </h3>

            {predictions.length > 0 ? predictions.map((emp, i) => (

              <div key={i} className="flex justify-between text-sm mb-3">

                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-xs text-gray-400">
                    Late: {emp.lateCount} | Absent: {emp.absentCount}
                  </p>
                </div>

                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  High
                </span>

              </div>

            )) : (
              <p className="text-sm text-gray-500">
                No irregular attendance
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
