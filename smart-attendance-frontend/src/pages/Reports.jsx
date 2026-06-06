import { useEffect, useState } from "react";
import { Building2, Download, FileText, Info, UserRound } from "lucide-react";
import { generateAdminReport, generateUserReport } from "../api/reportApi";
import { getEmployees } from "../api/employeeApi";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("individual");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleGenerateIndividualReport = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    setLoading(true);
    try {
      await generateUserReport(selectedEmployee, startDate, endDate);
      alert("Report downloaded successfully!");
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllReport = async () => {
    setLoading(true);
    try {
      await generateAdminReport(startDate, endDate);
      alert("Company report downloaded successfully!");
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === "individual") {
      handleGenerateIndividualReport();
    } else {
      handleGenerateAllReport();
    }
  };

  const individualContents = [
    "Employee information and details",
    "Attendance summary",
    "Working hours statistics",
    "Detailed attendance records",
    "Approved leave records",
    "Late check-in count",
  ];

  const companyContents = [
    "Company-wide attendance overview",
    "Employee-wise attendance summary",
    "Department-wise statistics",
    "Total working hours per employee",
    "Leave and absence tracking",
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <FileText size={15} />
          Export
        </p>
        <h1 className="page-title">Generate Reports</h1>
        <p className="page-subtitle mt-2">
          Download attendance summaries as PDF reports.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,680px)_1fr]">
        <section className="glass-panel-strong p-6">
          <div className="mb-6">
            <span className="form-label">Report Type</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setReportType("individual")}
                className={`btn justify-start ${reportType === "individual" ? "btn-primary" : "btn-secondary"}`}
              >
                <UserRound size={18} />
                Individual Employee
              </button>
              <button
                type="button"
                onClick={() => setReportType("all")}
                className={`btn justify-start ${reportType === "all" ? "btn-primary" : "btn-secondary"}`}
              >
                <Building2 size={18} />
                All Employees
              </button>
            </div>
          </div>

          {reportType === "individual" && (
            <label className="mb-4 block">
              <span className="form-label">Select Employee *</span>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="form-field"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId}) - {emp.department}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mb-5">
            <span className="form-label">Date Range (Optional)</span>
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
              Leave empty to include all records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            <Download size={18} />
            {loading
              ? "Generating PDF..."
              : `Download ${reportType === "individual" ? "Employee" : "Company"} Report`}
          </button>
        </section>

        <aside className="glass-panel-strong p-6">
          <div className="mb-4 flex items-center gap-2">
            <Info className="text-[#6d28d9]" size={20} />
            <h2 className="section-title">Report Contents</h2>
          </div>

          <ul className="space-y-3">
            {(reportType === "individual" ? individualContents : companyContents).map((item) => (
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

export default Reports;
