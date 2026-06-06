import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import {
  getAllEmployeesLeaveBalance,
  getLeaveBalanceStats,
  resetLeaveBalanceForYear,
  updateEmployeeLeaveBalance,
} from "../api/leaveBalanceApi";

const LeaveBalance = () => {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editLeaveType, setEditLeaveType] = useState("");
  const [editTotal, setEditTotal] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetYear, setResetYear] = useState(new Date().getFullYear() + 1);
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  useEffect(() => {
    fetchData();
  // Fetch when the visible search controls change; fetchData depends on those same values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedDepartment]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, statsData] = await Promise.all([
        getAllEmployeesLeaveBalance({ search: searchTerm, department: selectedDepartment }),
        getLeaveBalanceStats(),
      ]);
      setEmployees(employeesData.data.employees || []);
      setStats(statsData.data || null);
    } catch (error) {
      console.error("Error fetching leave balance data:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
      } else {
        alert("Failed to fetch leave balance data. Please try again.");
        setEmployees([]);
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditLeaveBalance = (employee) => {
    setEditingEmployee(employee);
    setEditLeaveType("");
    setEditTotal("");
  };

  const handleUpdateLeaveBalance = async () => {
    if (!editLeaveType || !editTotal) {
      alert("Please select leave type and enter total days");
      return;
    }

    try {
      await updateEmployeeLeaveBalance(editingEmployee.id, {
        leaveType: editLeaveType,
        total: parseInt(editTotal),
      });
      alert("Leave balance updated successfully");
      setEditingEmployee(null);
      fetchData();
    } catch (error) {
      console.error("Error updating leave balance:", error);
      alert(error.response?.data?.message || "Failed to update leave balance");
    }
  };

  const handleResetLeaveBalance = async () => {
    if (
      !window.confirm(
        `Are you sure you want to reset leave balance for all employees for year ${resetYear}? This will reset all used leaves to 0.`
      )
    ) {
      return;
    }

    try {
      const response = await resetLeaveBalanceForYear({ year: resetYear });
      alert(response.message);
      setShowResetModal(false);
      fetchData();
    } catch (error) {
      console.error("Error resetting leave balance:", error);
      alert(error.response?.data?.message || "Failed to reset leave balance");
    }
  };

  const getLeaveTypeColorForModal = (leaveType) => {
    const colors = {
      casual: "bg-blue-50 text-blue-800 border-blue-200",
      sick: "bg-red-50 text-red-800 border-red-200",
      annual: "bg-green-50 text-green-800 border-green-200",
      emergency: "bg-orange-50 text-orange-800 border-orange-200",
      maternity: "bg-pink-50 text-pink-800 border-pink-200",
      paternity: "bg-purple-50 text-purple-800 border-purple-200",
      other: "bg-gray-50 text-gray-800 border-gray-200",
    };
    return colors[leaveType] || colors.other;
  };

  const getUsagePercentage = (used, total) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      casual: "bg-blue-50 border-blue-200",
      sick: "bg-red-50 border-red-200",
      annual: "bg-green-50 border-green-200",
      emergency: "bg-orange-50 border-orange-200",
      maternity: "bg-pink-50 border-pink-200",
      paternity: "bg-purple-50 border-purple-200",
      other: "bg-gray-50 border-gray-200",
    };
    return colors[leaveType] || colors.other;
  };

  if (loading) {
    return (
      <div className="glass-panel-strong p-8 text-center text-sm font-bold text-[#635f86]">
        Loading leave balance...
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Employees", value: stats.totalEmployees, icon: Users, tone: "bg-[#ede9fe] text-[#6d28d9]" },
        { label: "Total Allocated", value: stats.overall.totalAllocated, icon: TrendingUp, tone: "bg-green-100 text-green-700" },
        { label: "Total Used", value: stats.overall.totalUsed, icon: Calendar, tone: "bg-amber-100 text-amber-700" },
        { label: "Total Remaining", value: stats.overall.totalRemaining, icon: AlertCircle, tone: "bg-blue-100 text-blue-700" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="page-kicker mb-3">
            <WalletCards size={15} />
            Allocation
          </p>
          <h1 className="page-title">Leave Balance Management</h1>
          <p className="page-subtitle mt-2">Track and manage employee leave allocations.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={fetchData} className="btn btn-secondary">
            <RefreshCw size={17} />
            Refresh
          </button>
          <button type="button" onClick={() => setShowResetModal(true)} className="btn btn-primary">
            <Calendar size={17} />
            Reset for New Year
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="metric-card">
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#635f86]">{card.label}</p>
                    <p className="mt-2 text-3xl font-black text-[#16123a]">{card.value}</p>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]" size={19} />
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-field pl-10"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="form-field"
          >
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </section>

      <section className="glass-panel-strong overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th className="text-center">Total Allocated</th>
                <th className="text-center">Total Used</th>
                <th className="text-center">Total Remaining</th>
                <th className="text-center">Usage %</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const usagePercentage = getUsagePercentage(
                  employee.summary.totalUsed,
                  employee.summary.totalAllocated
                );
                const isExpanded = expandedEmployee === employee.id;

                return (
                  <tr key={employee.id}>
                    <td colSpan="7" className="p-0">
                      <div className="grid min-w-[900px] grid-cols-[1.5fr_1fr_1fr_1fr_1fr_0.8fr_0.8fr] items-center border-b border-[#7d69be1f]">
                        <div className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedEmployee(isExpanded ? null : employee.id)}
                              className="icon-button h-8 w-8"
                              aria-label={isExpanded ? "Collapse leave details" : "Expand leave details"}
                            >
                              {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                            </button>
                            <div>
                              <div className="text-sm font-black text-[#16123a]">{employee.name}</div>
                              <div className="text-sm font-semibold text-[#635f86]">{employee.employeeId}</div>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-4">
                          <span className="status-badge status-info">{employee.department}</span>
                        </div>
                        <div className="px-4 py-4 text-center text-sm font-bold text-[#16123a]">{employee.summary.totalAllocated}</div>
                        <div className="px-4 py-4 text-center text-sm font-bold text-[#16123a]">{employee.summary.totalUsed}</div>
                        <div className="px-4 py-4 text-center text-sm font-black text-green-700">{employee.summary.totalRemaining}</div>
                        <div className={`px-4 py-4 text-center text-sm font-black ${getUsageColor(usagePercentage)}`}>{usagePercentage}%</div>
                        <div className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleEditLeaveBalance(employee)}
                            className="icon-button"
                            aria-label={`Edit leave balance for ${employee.name}`}
                          >
                            <Edit2 size={17} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-white/38 px-6 py-5">
                          <h4 className="mb-3 text-sm font-black text-[#16123a]">
                            Detailed Leave Breakdown for {employee.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {Object.entries(employee.leaveBalance).map(([type, balance]) => {
                              const typeUsagePercentage = getUsagePercentage(balance.used, balance.total);
                              const typeColor = getLeaveTypeColor(type);

                              return (
                                <div key={type} className={`rounded-[8px] border p-3 ${typeColor}`}>
                                  <div className="mb-2 flex items-center justify-between">
                                    <p className="text-xs font-black uppercase text-[#3b3563]">{type}</p>
                                    <span className={`text-xs font-black ${getUsageColor(typeUsagePercentage)}`}>
                                      {typeUsagePercentage}%
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-[#635f86]">Total:</span>
                                      <span className="font-black text-[#16123a]">{balance.total} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#635f86]">Used:</span>
                                      <span className="font-black text-red-600">{balance.used} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#635f86]">Remaining:</span>
                                      <span className="font-black text-green-700">{balance.remaining} days</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 h-2 w-full rounded-full bg-white/70">
                                    <div
                                      className={`h-2 rounded-full ${
                                        typeUsagePercentage >= 90
                                          ? "bg-red-500"
                                          : typeUsagePercentage >= 70
                                          ? "bg-orange-500"
                                          : typeUsagePercentage >= 50
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                      }`}
                                      style={{ width: `${typeUsagePercentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-4 rounded-[8px] border border-blue-200 bg-blue-50/80 p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-blue-950">Total Leaves Used:</span>
                              <span className="text-lg font-black text-red-600">{employee.summary.totalUsed} days</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="font-black text-blue-950">Total Remaining:</span>
                              <span className="text-lg font-black text-green-700">{employee.summary.totalRemaining} days</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="empty-state">No employees found</div>
        )}
      </section>

      {editingEmployee && (
        <div className="modal-scrim">
          <div className="modal-card max-w-2xl p-6">
            <h2 className="mb-5 text-2xl font-black text-[#16123a]">
              Edit Leave Balance - {editingEmployee.name}
            </h2>

            <div className="mb-6">
              <h3 className="section-title mb-3">Current Leave Balance</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {Object.entries(editingEmployee.leaveBalance).map(([type, balance]) => (
                  <div key={type} className={`rounded-[8px] border p-3 ${getLeaveTypeColorForModal(type)}`}>
                    <p className="text-xs font-black uppercase">{type}</p>
                    <p className="text-lg font-black">{balance.remaining}/{balance.total}</p>
                    <p className="text-xs font-semibold">Used: {balance.used}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="form-label">Leave Type</span>
                <select
                  value={editLeaveType}
                  onChange={(e) => setEditLeaveType(e.target.value)}
                  className="form-field"
                >
                  <option value="">Select Leave Type</option>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="other">Other Leave</option>
                </select>
              </label>

              <label className="block">
                <span className="form-label">New Total Days</span>
                <input
                  type="number"
                  min="0"
                  value={editTotal}
                  onChange={(e) => setEditTotal(e.target.value)}
                  placeholder="Enter new total days"
                  className="form-field"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingEmployee(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleUpdateLeaveBalance} className="btn btn-primary">
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="modal-scrim">
          <div className="modal-card max-w-md p-6">
            <h2 className="mb-3 text-2xl font-black text-[#16123a]">Reset Leave Balance</h2>
            <p className="mb-5 text-sm font-semibold text-[#635f86]">
              This will reset all employees' leave balance for the new year. Used leaves will be set to 0 and remaining leaves will be restored to default values.
            </p>

            <label className="mb-5 block">
              <span className="form-label">Year</span>
              <input
                type="number"
                min="2020"
                max="2100"
                value={resetYear}
                onChange={(e) => setResetYear(parseInt(e.target.value))}
                className="form-field"
              />
            </label>

            <div className="mb-5 rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Warning: This action will reset leave balance for all employees. This cannot be undone.
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowResetModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleResetLeaveBalance} className="btn btn-primary">
                Reset Balance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalance;
