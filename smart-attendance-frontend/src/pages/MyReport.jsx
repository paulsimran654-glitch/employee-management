import { useContext, useState } from "react";
import { CalendarDays, Download, FileText, Info, UserRound } from "lucide-react";
import { generateUserReport } from "../api/reportApi";
import { AuthContext } from "../context/auth-context";

function MyReport() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGenerateReport = async () => {
    if (!user?._id) {
      alert("User information not found. Please login again.");
      return;
    }

    setLoading(true);
    try {
      await generateUserReport(user._id, startDate, endDate);
      alert("Your attendance report has been downloaded successfully!");
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setMonthPreset = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const setLastMonthPreset = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    setStartDate(lastMonth.toISOString().split("T")[0]);
    setEndDate(lastMonthEnd.toISOString().split("T")[0]);
  };

  const setThreeMonthPreset = () => {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    setStartDate(threeMonthsAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <FileText size={15} />
          Export
        </p>
        <h1 className="page-title">My Attendance Report</h1>
        <p className="page-subtitle mt-2">
          Download your personal attendance summary as a PDF.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,680px)_1fr]">
        <section className="glass-panel-strong p-6">
          <div className="mb-6 rounded-[8px] border border-white/70 bg-white/55 p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserRound className="text-[#6d28d9]" size={20} />
              <h2 className="section-title">Your Information</h2>
            </div>
            <div className="grid gap-2 text-sm font-semibold text-[#635f86] sm:grid-cols-2">
              <p><strong className="text-[#16123a]">Name:</strong> {user?.name}</p>
              <p><strong className="text-[#16123a]">Employee ID:</strong> {user?.employeeId}</p>
              <p><strong className="text-[#16123a]">Department:</strong> {user?.department}</p>
              <p><strong className="text-[#16123a]">Email:</strong> {user?.email}</p>
            </div>
          </div>

          <div className="mb-5">
            <span className="form-label">Select Date Range (Optional)</span>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#817aa3]">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-field"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#817aa3]">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-field"
                />
              </label>
            </div>
            <p className="mt-2 text-xs font-semibold text-[#817aa3]">
              Leave empty to download your complete attendance history.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            <Download size={18} />
            {loading ? "Generating PDF..." : "Download My Report"}
          </button>

          <div className="mt-6">
            <p className="mb-2 flex items-center gap-2 text-sm font-black text-[#16123a]">
              <CalendarDays size={17} />
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={setMonthPreset} className="btn btn-secondary min-h-9 px-3 py-1 text-sm">
                This Month
              </button>
              <button type="button" onClick={setLastMonthPreset} className="btn btn-secondary min-h-9 px-3 py-1 text-sm">
                Last Month
              </button>
              <button type="button" onClick={setThreeMonthPreset} className="btn btn-secondary min-h-9 px-3 py-1 text-sm">
                Last 3 Months
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="btn btn-secondary min-h-9 px-3 py-1 text-sm"
              >
                All Time
              </button>
            </div>
          </div>
        </section>

        <aside className="glass-panel-strong p-6">
          <div className="mb-4 flex items-center gap-2">
            <Info className="text-[#6d28d9]" size={20} />
            <h2 className="section-title">Your Report Includes</h2>
          </div>
          <ul className="space-y-3">
            {[
              "Complete attendance summary",
              "Present, absent, and half-day records",
              "Working hours and daily average",
              "Detailed check-in and check-out times",
              "Approved leave records",
              "Late check-in statistics",
              "Photo capture status",
            ].map((item) => (
              <li key={item} className="flex gap-3 rounded-[8px] border border-white/70 bg-white/55 p-3 text-sm font-bold text-[#3b3563]">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default MyReport;
