import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarCheck, Eye, Pencil, Search } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

export default function Attendance() {
  const [records, setRecords] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [newCheckout, setNewCheckout] = useState("");
  const [reason, setReason] = useState("");

  const [showReasonId, setShowReasonId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  async function fetchAttendance() {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN_ATTENDANCE, {
        withCredentials: true,
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching attendance", err);
    }
  }

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.ADMIN_ATTENDANCE, { withCredentials: true })
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Error fetching attendance", err));
  }, []);

  const handleUpdate = async (item) => {
    if (!newCheckout) return alert("Enter checkout time");
    if (!reason) return alert("Enter reason");

    const [inH, inM] = item.checkIn.split(":").map(Number);
    const [outH, outM] = newCheckout.split(":").map(Number);

    if (outH * 60 + outM <= inH * 60 + inM) {
      return alert("Checkout must be after check-in");
    }

    try {
      await axios.put(
        `${API_ENDPOINTS.ADMIN_ATTENDANCE}/${item._id}`,
        { checkOut: newCheckout, reason },
        { withCredentials: true }
      );

      setEditingId(null);
      setNewCheckout("");
      setReason("");

      await fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNewCheckout("");
    setReason("");
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const [inH, inM] = checkIn.split(":").map(Number);
    const [outH, outM] = checkOut.split(":").map(Number);
    return (((outH * 60 + outM) - (inH * 60 + inM)) / 60).toFixed(2) + "h";
  };

  const statusStyle = (status) => {
    if (status === "present") return "status-badge status-present";
    if (status === "late") return "status-badge status-late";
    if (status === "absent") return "status-badge status-absent";
    if (status === "on-leave") return "status-badge status-leave";
    return "status-badge bg-gray-100 text-gray-600";
  };

  const canEdit = (item) => {
    if (!item.checkIn) return false;
    if (item.checkOut) return false;
    if (item.status === "absent" || item.status === "on-leave") return false;

    const today = new Date();
    const recordDate = new Date(item.date);
    const diffTime = today - recordDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const isToday =
      today.getDate() === recordDate.getDate() &&
      today.getMonth() === recordDate.getMonth() &&
      today.getFullYear() === recordDate.getFullYear();

    return isToday || diffDays <= 2;
  };

  const getDateKey = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  const departments = Array.from(
    new Set(records.map((item) => item.employee?.department).filter(Boolean))
  ).sort();

  const filteredRecords = records.filter((item) => {
    const employee = item.employee || {};
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      employee.name?.toLowerCase().includes(search) ||
      employee.employeeId?.toLowerCase().includes(search) ||
      employee.email?.toLowerCase().includes(search);

    const matchesDepartment =
      !selectedDepartment || employee.department === selectedDepartment;

    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesDate = !selectedDate || getDateKey(item.date) === selectedDate;

    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  const getPagination = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <CalendarCheck size={15} />
          Records
        </p>
        <h1 className="page-title">Attendance Records</h1>
        <p className="page-subtitle mt-2">{filteredRecords.length} records</p>
      </div>

      <section className="glass-panel-strong p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]"
              size={19}
            />
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-field pl-10"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="form-field"
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="form-field"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on-leave">On Leave</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
            className="form-field lg:col-span-4"
          />
        </div>
      </section>

      <section className="glass-panel-strong overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Hours</th>
                <th>Edit</th>
              </tr>
            </thead>

            <tbody>
              {currentRecords.map((item) => (
                <tr key={item._id}>
                  <td className="font-black text-[#16123a]">{item.employee?.name}</td>
                  <td>{item.employee?.department}</td>
                  <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>
                  <td>{item.checkIn || "-"}</td>

                  <td>
                    {editingId === item._id ? (
                      <div className="flex min-w-44 flex-col gap-2">
                        <input
                          type="time"
                          value={newCheckout}
                          onChange={(e) => setNewCheckout(e.target.value)}
                          className="form-field py-2"
                        />
                        <input
                          type="text"
                          placeholder="Reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="form-field py-2"
                        />
                      </div>
                    ) : (
                      item.checkOut || "-"
                    )}
                  </td>

                  <td>
                    <div className="flex flex-col items-start gap-1">
                      <span className={statusStyle(item.status)}>
                        {item.status === "on-leave" ? "On Leave" : item.status}
                      </span>
                      {item.isLeave && (
                        <span className="text-xs font-semibold text-[#817aa3]">
                          Leave approved
                        </span>
                      )}
                    </div>
                  </td>

                  <td>{calculateHours(item.checkIn, item.checkOut)}</td>

                  <td>
                    <div className="flex items-center gap-2">
                      {item.reason && (
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() =>
                            setShowReasonId(showReasonId === item._id ? null : item._id)
                          }
                          aria-label="Toggle reason"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      {editingId === item._id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(item)}
                            className="btn btn-primary min-h-9 px-3 py-1 text-xs"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-secondary min-h-9 px-3 py-1 text-xs"
                          >
                            Cancel
                          </button>
                        </>
                      ) : canEdit(item) ? (
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            setEditingId(item._id);
                            setNewCheckout("");
                            setReason("");
                          }}
                          aria-label="Edit attendance"
                        >
                          <Pencil size={16} />
                        </button>
                      ) : (
                        <span className="icon-button cursor-not-allowed opacity-35">
                          <Pencil size={16} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentRecords.map((item) =>
                showReasonId === item._id ? (
                  <tr key={`${item._id}-reason`}>
                    <td colSpan="8" className="bg-white/45">
                      <span className="font-black text-[#16123a]">Reason:</span>{" "}
                      {item.reason}
                    </td>
                  </tr>
                ) : null
              )}

              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="btn btn-secondary min-h-9 px-3 py-1 text-sm"
          >
            Prev
          </button>

          {getPagination().map((page, i) =>
            page === "..." ? (
              <span key={`dots-${i}`} className="px-2 py-2 text-[#635f86]">
                ...
              </span>
            ) : (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`btn min-h-9 px-3 py-1 text-sm ${
                  currentPage === page ? "btn-primary" : "btn-secondary"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="btn btn-secondary min-h-9 px-3 py-1 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
