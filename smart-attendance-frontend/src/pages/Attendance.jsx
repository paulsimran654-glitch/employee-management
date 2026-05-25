import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Eye, Search } from "lucide-react";
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
      const res = await axios.get(
        API_ENDPOINTS.ADMIN_ATTENDANCE,
        { withCredentials: true }
      );
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching attendance", err);
    }
  }

  useEffect(() => {
    axios.get(
      API_ENDPOINTS.ADMIN_ATTENDANCE,
      { withCredentials: true }
    )
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Error fetching attendance", err));
  }, []);

  const handleUpdate = async (item) => {

    if (!newCheckout) return alert("Enter checkout time");
    if (!reason) return alert("Enter reason");

    const [inH, inM] = item.checkIn.split(":").map(Number);
    const [outH, outM] = newCheckout.split(":").map(Number);

    if ((outH * 60 + outM) <= (inH * 60 + inM)) {
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
    if (status === "present") return "bg-green-100 text-green-600";
    if (status === "late") return "bg-yellow-100 text-yellow-600";
    if (status === "absent") return "bg-red-100 text-red-600";
    if (status === "on-leave") return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  // ✅ FIXED STRUCTURE (LOGIC SAME)
  const canEdit = (item) => {
    if (!item.checkIn) return false;

    // ❌ If checkout exists → NEVER editable
    if (item.checkOut) return false;

    // ❌ Absent or on-leave → no edit
    if (item.status === "absent" || item.status === "on-leave") return false;

    const today = new Date();
    const recordDate = new Date(item.date);

    const diffTime = today - recordDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const isToday =
      today.getDate() === recordDate.getDate() &&
      today.getMonth() === recordDate.getMonth() &&
      today.getFullYear() === recordDate.getFullYear();

    // ✅ Only incomplete + within 2 days OR today
    return isToday || diffDays <= 2;
  };

  const getDateKey = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  const departments = Array.from(
    new Set(
      records
        .map((item) => item.employee?.department)
        .filter(Boolean)
    )
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

    const matchesStatus =
      !selectedStatus || item.status === selectedStatus;

    const matchesDate =
      !selectedDate || getDateKey(item.date) === selectedDate;

    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });

  // ================= PAGINATION =================
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
    <div className="p-6 space-y-6">

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
        <p className="text-gray-500 text-sm">{filteredRecords.length} records</p>
      </div>

      <div className="max-w-6xl mx-auto bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-4"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Check In</th>
              <th className="p-3 text-left">Check Out</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Hours</th>
              <th className="p-3 text-left">Edit</th>
            </tr>
          </thead>

          <tbody>
            {currentRecords.map((item) => (
              <tr key={item._id} className="border-t">

                <td className="p-3">{item.employee?.name}</td>
                <td className="p-3">{item.employee?.department}</td>
                <td className="p-3">{new Date(item.date).toLocaleDateString("en-IN")}</td>

                <td className="p-3">{item.checkIn || "-"}</td>

                <td className="p-3">
                  {editingId === item._id ? (
                    <div className="flex flex-col gap-2">
                      <input type="time" value={newCheckout} onChange={(e) => setNewCheckout(e.target.value)} className="border px-2 py-1 rounded"/>
                      <input type="text" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} className="border px-2 py-1 rounded"/>
                    </div>
                  ) : item.checkOut || "-"}
                </td>

                <td className="p-3">
                  <div className="flex flex-col">
                    <span className={`px-2 py-1 text-xs rounded-full inline-block w-fit ${statusStyle(item.status)}`}>
                      {item.status === "on-leave" ? "On Leave" : item.status}
                    </span>
                    {item.isLeave && (
                      <span className="text-xs text-gray-500 mt-1">
                        (Leave approved)
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3">{calculateHours(item.checkIn, item.checkOut)}</td>

                <td className="p-3 flex gap-2 items-center">

                  {item.reason && (
                    <Eye size={16} className="text-gray-500 cursor-pointer hover:text-blue-600 transition duration-200"
                      onClick={() =>
                        setShowReasonId(showReasonId === item._id ? null : item._id)
                      }
                    />
                  )}

                  {editingId === item._id ? (
                    <>
                      <button onClick={() => handleUpdate(item)} className="text-blue-600 text-sm">Save</button>
                      <button onClick={handleCancel} className="text-gray-500 text-sm">Cancel</button>
                    </>
                  ) : canEdit(item) ? (
                    <Pencil size={16} className="cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setEditingId(item._id);
                        setNewCheckout("");
                        setReason("");
                      }}
                    />
                  ) : (
                    <Pencil size={16} className="text-gray-300 cursor-not-allowed"/>
                  )}

                </td>

              </tr>
            ))}

            {currentRecords.map((item) =>
              showReasonId === item._id ? (
                <tr key={item._id + "-reason"}>
                  <td colSpan="8" className="bg-gray-50 p-3">
                    <strong>Reason:</strong> {item.reason}
                  </td>
                </tr>
              ) : null
            )}

            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* ================= PAGINATION UI ================= */}
      {totalPages > 0 && (
      <div className="flex justify-center items-center gap-2">

        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Prev
        </button>

        {getPagination().map((page, i) =>
          page === "..." ? (
            <span key={i} className="px-2">...</span>
          ) : (
            <button
              key={i}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Next
        </button>

      </div>
      )}

    </div>
  );
}
