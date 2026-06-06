import { useContext, useEffect, useState } from "react";
import { CalendarDays, Plus, WalletCards } from "lucide-react";
import {
  applyLeave,
  cancelLeave,
  getEmployeeLeaveBalance,
  getMyLeaves,
} from "../api/leaveApi";
import { AuthContext } from "../context/auth-context";

export default function EmployeeLeaves() {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0,
  });

  const [formData, setFormData] = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const leaveTypes = [
    { value: "sick", label: "Sick Leave" },
    { value: "casual", label: "Casual Leave" },
    { value: "annual", label: "Annual Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "paternity", label: "Paternity Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "other", label: "Other" },
  ];

  const statusClass = {
    pending: "status-badge status-pending",
    approved: "status-badge status-approved",
    rejected: "status-badge status-rejected",
  };

  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await getMyLeaves(params);
      if (response.success) {
        setLeaves(response.data.leaves);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      alert("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    if (!user?._id) return;

    try {
      setBalanceLoading(true);
      const response = await getEmployeeLeaveBalance(user._id);
      if (response.success) {
        setLeaveBalance(response.data);
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  // Keep the fetch cadence tied to filter/user changes without recreating fetch helpers each render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("End date cannot be before start date");
      return;
    }

    try {
      setLoading(true);
      const response = await applyLeave(formData);

      if (response.success) {
        alert("Leave application submitted successfully!");
        setShowApplyForm(false);
        setFormData({
          leaveType: "sick",
          startDate: "",
          endDate: "",
          reason: "",
        });
        fetchLeaves();
        fetchLeaveBalance();
      }
    } catch (error) {
      console.error("Error applying leave:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit leave application";

      if (errorMessage.includes("already marked attendance")) {
        alert(`${errorMessage}\n\nYou cannot apply for leave on dates where you have already marked attendance.`);
      } else if (errorMessage.includes("overlapping")) {
        alert(`${errorMessage}\n\nPlease check your existing leave applications.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!confirm("Are you sure you want to cancel this leave application?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await cancelLeave(leaveId);

      if (response.success) {
        alert("Leave application cancelled successfully!");
        fetchLeaves();
      }
    } catch (error) {
      console.error("Error cancelling leave:", error);
      const errorMessage = error.response?.data?.message || "Failed to cancel leave application";

      if (errorMessage.includes("attendance records created")) {
        alert(`${errorMessage}\n\nYour leave has been approved and attendance records have been created. Please contact admin to cancel.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <WalletCards size={15} />
          Balance
        </p>
        <h1 className="page-title">My Leave Balance</h1>
        <p className="page-subtitle mt-2">Track available leave and manage applications.</p>
      </div>

      {balanceLoading ? (
        <section className="glass-panel-strong p-8 text-center text-sm font-bold text-[#635f86]">
          Loading leave balance...
        </section>
      ) : leaveBalance ? (
        <section className="glass-panel-strong overflow-hidden">
          <div className="border-b border-[#7d69be24] px-5 py-4">
            <h2 className="section-title">Available Leaves - Year {leaveBalance.year}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {Object.entries(leaveBalance.leaveBalance).map(([type, balance]) => {
              const colorClass =
                balance.remaining === 0
                  ? "border-red-200 bg-red-50 text-red-700"
                  : balance.remaining <= 3
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-green-200 bg-green-50 text-green-700";

              return (
                <div key={type} className={`rounded-[8px] border p-4 text-center ${colorClass}`}>
                  <h4 className="mb-2 text-sm font-black capitalize">{type}</h4>
                  <div className="text-3xl font-black">{balance.remaining}</div>
                  <div className="text-xs font-bold">days left</div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="glass-panel-strong p-8 text-center text-sm font-bold text-[#635f86]">
          No leave balance data available
        </section>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="page-kicker mb-3">
            <CalendarDays size={15} />
            Requests
          </p>
          <h2 className="page-title">My Leave Applications</h2>
          <p className="page-subtitle mt-2">Manage your leave requests.</p>
        </div>
        <button type="button" onClick={() => setShowApplyForm(true)} className="btn btn-primary">
          <Plus size={17} />
          Apply for Leave
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`btn min-h-10 px-4 py-2 capitalize ${
              filter === status ? "btn-primary" : "btn-secondary"
            }`}
          >
            {status === "all" ? "All Leaves" : status}
          </button>
        ))}
      </div>

      {showApplyForm && (
        <div className="modal-scrim">
          <div className="modal-card max-w-md p-6">
            <h2 className="mb-5 text-2xl font-black text-[#16123a]">Apply for Leave</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="form-label">Leave Type *</span>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="form-field"
                  required
                >
                  {leaveTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {leaveBalance && leaveBalance.leaveBalance[formData.leaveType] && (
                  <div className="mt-2 rounded-[8px] border border-blue-200 bg-blue-50 p-2 text-sm font-semibold text-blue-800">
                    Available: {leaveBalance.leaveBalance[formData.leaveType].remaining} days remaining
                  </div>
                )}
              </label>

              <label className="block">
                <span className="form-label">Start Date *</span>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="form-field"
                  required
                />
              </label>

              <label className="block">
                <span className="form-label">End Date *</span>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split("T")[0]}
                  className="form-field"
                  required
                />
              </label>

              {formData.startDate && formData.endDate && (
                <div className="rounded-[8px] border border-[#7d69be2e] bg-white/55 p-3 text-sm font-bold text-[#635f86]">
                  Total Days: {calculateDays(formData.startDate, formData.endDate)}
                </div>
              )}

              <label className="block">
                <span className="form-label">Reason *</span>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide reason for leave..."
                  rows={3}
                  maxLength={500}
                  className="form-field"
                  required
                />
                <div className="mt-1 text-xs font-semibold text-[#817aa3]">
                  {formData.reason.length}/500 characters
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowApplyForm(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="glass-panel-strong overflow-hidden">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">No leave applications found</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="font-black capitalize text-[#16123a]">{leave.leaveType}</div>
                      <div className="max-w-xs truncate text-sm font-semibold text-[#635f86]">{leave.reason}</div>
                    </td>
                    <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                    <td>{leave.totalDays}</td>
                    <td>
                      <span className={statusClass[leave.status]}>{leave.status}</span>
                    </td>
                    <td>{formatDate(leave.appliedDate)}</td>
                    <td>
                      {leave.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleCancelLeave(leave._id)}
                          className="btn btn-danger min-h-9 px-3 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      {leave.status !== "pending" && leave.adminComments && (
                        <div className="text-xs font-semibold text-[#635f86]">
                          Admin: {leave.adminComments}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total > 1 && (
          <div className="flex flex-col gap-3 border-t border-[#7d69be24] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-[#635f86]">
              Showing {leaves.length} of {pagination.totalRecords} results
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchLeaves(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="btn btn-secondary min-h-9 px-3 py-1 text-sm"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-bold text-[#635f86]">
                Page {pagination.current} of {pagination.total}
              </span>
              <button
                type="button"
                onClick={() => fetchLeaves(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
                className="btn btn-secondary min-h-9 px-3 py-1 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
