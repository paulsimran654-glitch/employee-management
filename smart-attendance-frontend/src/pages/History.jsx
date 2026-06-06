import { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarDays, ListFilter } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.ATTENDANCE_HISTORY, {
          withCredentials: true,
        });
        setRecords(res.data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";

    const [inH, inM] = checkIn.split(":").map(Number);
    const [outH, outM] = checkOut.split(":").map(Number);
    const diff = outH * 60 + outM - (inH * 60 + inM);

    return (diff / 60).toFixed(2) + "h";
  };

  const getStatusBadge = (status) => {
    if (status === "present") return "status-badge status-present";
    if (status === "late") return "status-badge status-late";
    if (status === "absent") return "status-badge status-absent";
    if (status === "on-leave") return "status-badge status-leave";
    return "status-badge bg-gray-100 text-gray-600";
  };

  const filteredRecords = records.filter((item) => {
    if (!selectedDate) return true;
    return new Date(item.date).toISOString().slice(0, 10) === selectedDate;
  });

  const getTileClass = ({ date, view }) => {
    if (view !== "month") return "";

    const record = records.find((r) => {
      const d = new Date(r.date);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    if (!record) return "";
    if (record.status === "present") return "present-day";
    if (record.status === "absent") return "absent-day";
    if (record.status === "late") return "late-day";
    if (record.status === "on-leave") return "leave-day";

    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="page-kicker mb-3">
            <CalendarDays size={15} />
            Timeline
          </p>
          <h1 className="page-title">Attendance History</h1>
          <p className="page-subtitle mt-2">{filteredRecords.length} records</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            className="form-field sm:w-48"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowCalendar((show) => !show)}
            className="btn btn-primary"
          >
            <ListFilter size={17} />
            {showCalendar ? "Table View" : "Calendar View"}
          </button>
        </div>
      </div>

      {showCalendar && (
        <section className="glass-panel-strong p-5 sm:p-8">
          <div className="mb-6 flex flex-wrap justify-center gap-3 text-sm font-bold text-[#635f86]">
            <div className="flex items-center gap-2 rounded-[8px] bg-white/60 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              Present
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-white/60 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              Absent
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-white/60 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              Late
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-white/60 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              On Leave
            </div>
          </div>

          <Calendar tileClassName={getTileClass} />
        </section>
      )}

      {!showCalendar && (
        <section className="glass-panel-strong overflow-hidden">
          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="empty-state">No attendance found</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((item, index) => (
                    <tr key={index}>
                      <td className="font-black text-[#16123a]">
                        {new Date(item.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td>{item.checkIn || "-"}</td>
                      <td>{item.checkOut || "-"}</td>

                      <td>
                        <span className={getStatusBadge(item.status)}>
                          {item.status === "on-leave" ? "On Leave" : item.status}
                        </span>
                        {item.reason && (
                          <div className="mt-1 text-xs font-semibold text-[#817aa3]">
                            {item.reason}
                          </div>
                        )}
                      </td>

                      <td>{calculateHours(item.checkIn, item.checkOut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
