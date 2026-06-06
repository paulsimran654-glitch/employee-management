import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, ClipboardCheck, Clock3, Search, XCircle } from "lucide-react";
import { getAllLeaves, getLeaveStats, reviewLeave } from "../api/leaveApi";
import { getEmployeeLeaveBalance } from "../api/leaveBalanceApi";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [employeeBalance, setEmployeeBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "approved",
    adminComments: "",
  });

  const [filters, setFilters] = useState({
    status: "all",
    employeeId: "",
    leaveType: "all",
    page: 1,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0,
  });

  const leaveTypes = [
    { value: "all", label: "All Types" },
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

      if (filters.status !== "all") params.status = filters.status;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.leaveType !== "all") params.leaveType = filters.leaveType;

      const response = await getAllLeaves(params);
      if (response.success) {
        setLeaves(response.data.leaves);
        setPagination(response.data.pagination);

        if (response.data.summary) {
          setStats(response.data.summary);
        }
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      alert("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getLeaveStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  // Employee ID searches are submitted by the Search button to avoid fetching on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.leaveType]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchLeaves(1);
  };

  const handleReview = async () => {
    if (!selectedLeave || !reviewData.status) {
      alert("Please select status");
      return;
    }

    if (reviewData.status === "approved" && employeeBalance) {
      const leaveType = selectedLeave.leaveType;
      const requestedDays = selectedLeave.totalDays;
      const availableDays = employeeBalance.leaveBalance[leaveType]?.remaining || 0;

      if (availableDays < requestedDays) {
        if (
          !confirm(
            `Warning: Employee has only ${availableDays} ${leaveType} leave(s) remaining, but requested ${requestedDays} day(s).\n\nDo you still want to approve this leave?`
          )
        ) {
          return;
        }
      }
    }

    try {
      setLoading(true);
      const response = await reviewLeave(selectedLeave._id, reviewData);

      if (response.success) {
        const message = response.message || `Leave application ${reviewData.status} successfully!`;
        alert(message);

        setShowReviewModal(false);
        setSelectedLeave(null);
        setEmployeeBalance(null);
        setReviewData({ status: "approved", adminComments: "" });
        fetchLeaves(filters.page);
        fetchStats();
      }
    } catch (error) {
      console.error("Error reviewing leave:", error);
      alert(error.response?.data?.message || "Failed to review leave application");
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

  const openReviewModal = async (leave) => {
    setSelectedLeave(leave);
    setReviewData({ status: "approved", adminComments: "" });
    setShowReviewModal(true);

    if (leave.employee?._id) {
      try {
        setLoadingBalance(true);
        const response = await getEmployeeLeaveBalance(leave.employee._id);
        if (response.success) {
          setEmployeeBalance(response.data);
        }
      } catch (error) {
        console.error("Error fetching employee balance:", error);
        setEmployeeBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }
  };

  const statCards = [
    { label: "Total Applications", value: stats?.total || 0, icon: CalendarDays, tone: "bg-[#ede9fe] text-[#6d28d9]" },
    { label: "Pending Review", value: stats?.pending || 0, icon: Clock3, tone: "bg-amber-100 text-amber-700" },
    { label: "Approved", value: stats?.approved || 0, icon: CheckCircle, tone: "bg-green-100 text-green-700" },
    { label: "Rejected", value: stats?.rejected || 0, icon: XCircle, tone: "bg-red-100 text-red-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <ClipboardCheck size={15} />
          Review Queue
        </p>
        <h1 className="page-title">Leave Management</h1>
        <p className="page-subtitle mt-2">
          Review and manage employee leave applications.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="metric-card">
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-3xl font-black text-[#16123a]">{card.value}</div>
                    <div className="text-sm font-bold text-[#635f86]">{card.label}</div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-[8px] ${card.tone}`}>
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="glass-panel-strong p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="block">
            <span className="form-label">Status</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="form-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="block">
            <span className="form-label">Leave Type</span>
            <select
              value={filters.leaveType}
              onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
              className="form-field"
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="form-label">Employee ID</span>
            <input
              type="text"
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              placeholder="Search by ID"
              className="form-field"
            />
          </label>

          <div className="flex items-end">
            <button type="button" onClick={handleSearch} className="btn btn-primary w-full">
              <Search size={17} />
              Search
            </button>
          </div>
        </div>
      </section>

      {showReviewModal && selectedLeave && (
        <div className="modal-scrim">
          <div className="modal-card max-w-3xl p-6">
            <h2 className="mb-5 text-2xl font-black text-[#16123a]">
              Review Leave Application
            </h2>

            <div className="mb-4 rounded-[8px] border border-white/70 bg-white/55 p-4">
              <div className="grid gap-2 text-sm font-semibold text-[#635f86] sm:grid-cols-2">
                <div><strong className="text-[#16123a]">Employee:</strong> {selectedLeave.employee?.name} ({selectedLeave.employee?.employeeId})</div>
                <div><strong className="text-[#16123a]">Department:</strong> {selectedLeave.employee?.department}</div>
                <div><strong className="text-[#16123a]">Type:</strong> <span className="capitalize">{selectedLeave.leaveType}</span></div>
                <div><strong className="text-[#16123a]">Dates:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</div>
                <div><strong className="text-[#16123a]">Days:</strong> {selectedLeave.totalDays}</div>
                <div className="sm:col-span-2"><strong className="text-[#16123a]">Reason:</strong> {selectedLeave.reason}</div>
              </div>
            </div>

            <div className="mb-4 rounded-[8px] border border-[#bfdbfe] bg-blue-50/70 p-4">
              <h3 className="mb-3 text-sm font-black text-blue-950">Employee Leave Balance</h3>

              {loadingBalance ? (
                <div className="py-4 text-center text-sm font-bold text-[#635f86]">Loading balance...</div>
              ) : employeeBalance ? (
                <div>
                  <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {Object.entries(employeeBalance.leaveBalance).map(([type, balance]) => {
                      const isRequestedType = type === selectedLeave.leaveType;
                      const willExceed = isRequestedType && balance.remaining < selectedLeave.totalDays;

                      return (
                        <div
                          key={type}
                          className={`rounded-[8px] border p-3 text-xs ${
                            isRequestedType
                              ? willExceed
                                ? "border-red-300 bg-red-50"
                                : "border-green-300 bg-green-50"
                              : "border-white/80 bg-white/70"
                          }`}
                        >
                          <p className="font-black capitalize text-[#3b3563]">{type}</p>
                          <p className="text-xl font-black text-[#16123a]">
                            {balance.remaining}/{balance.total}
                          </p>
                          <p className="font-semibold text-[#635f86]">Used: {balance.used}</p>
                          {isRequestedType && (
                            <p className={`mt-1 font-black ${willExceed ? "text-red-600" : "text-green-700"}`}>
                              {willExceed ? "Insufficient" : "Available"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {employeeBalance.leaveBalance[selectedLeave.leaveType]?.remaining < selectedLeave.totalDays && (
                    <div className="rounded-[8px] border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                      Warning: Employee has only{" "}
                      <strong>{employeeBalance.leaveBalance[selectedLeave.leaveType]?.remaining}</strong>{" "}
                      {selectedLeave.leaveType} leave(s) remaining, but requested{" "}
                      <strong>{selectedLeave.totalDays}</strong> day(s).
                    </div>
                  )}

                  <div className="mt-3 border-t border-blue-200 pt-3 text-xs font-semibold text-[#635f86]">
                    <strong>Total:</strong> {employeeBalance.summary.totalRemaining}/{employeeBalance.summary.totalAllocated} days remaining
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#635f86]">Unable to load leave balance</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="form-label">Decision *</span>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  className="form-field"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </label>

              <label className="block">
                <span className="form-label">Comments (Optional)</span>
                <textarea
                  value={reviewData.adminComments}
                  onChange={(e) => setReviewData({ ...reviewData, adminComments: e.target.value })}
                  placeholder="Add comments for the employee..."
                  rows={3}
                  maxLength={500}
                  className="form-field"
                />
                <div className="mt-1 text-xs font-semibold text-[#817aa3]">
                  {reviewData.adminComments.length}/500 characters
                </div>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setEmployeeBalance(null);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReview}
                  disabled={loading}
                  className={`btn flex-1 ${reviewData.status === "approved" ? "btn-success" : "btn-danger"}`}
                >
                  {loading ? "Processing..." : `${reviewData.status === "approved" ? "Approve" : "Reject"} Leave`}
                </button>
              </div>
            </div>
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
                  <th>Employee</th>
                  <th>Leave Details</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="font-black text-[#16123a]">{leave.employee?.name}</div>
                      <div className="text-sm font-semibold text-[#635f86]">{leave.employee?.employeeId}</div>
                      <div className="text-xs font-semibold text-[#817aa3]">{leave.employee?.department}</div>
                    </td>
                    <td>
                      <div className="font-black capitalize text-[#16123a]">
                        {leave.leaveType} ({leave.totalDays} days)
                      </div>
                      <div className="max-w-xs truncate text-sm text-[#635f86]">{leave.reason}</div>
                    </td>
                    <td>
                      <div>{formatDate(leave.startDate)}</div>
                      <div className="text-[#635f86]">to {formatDate(leave.endDate)}</div>
                    </td>
                    <td>
                      <span className={statusClass[leave.status]}>{leave.status}</span>
                      {leave.reviewedBy && (
                        <div className="mt-1 text-xs font-semibold text-[#817aa3]">
                          by {leave.reviewedBy.name}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(leave.appliedDate)}</td>
                    <td>
                      {leave.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(leave)}
                          className="btn btn-primary min-h-9 px-3 py-1 text-xs"
                        >
                          Review
                        </button>
                      ) : (
                        <div className="text-xs font-semibold text-[#635f86]">
                          {leave.adminComments && <div>Comments: {leave.adminComments}</div>}
                          {leave.reviewedDate && <div>Reviewed: {formatDate(leave.reviewedDate)}</div>}
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
