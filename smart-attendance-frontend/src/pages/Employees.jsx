import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";

import EmployeeModal from "../components/EmployeeModal";

const Employees = () => {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, formData);
      } else {
        await createEmployee(formData);
      }

      setModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();

    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const departments = Array.from(
    new Set(
      employees
        .map((emp) => emp.department)
        .filter(Boolean)
    )
  ).sort();

  const filteredEmployees = employees.filter((emp) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      emp.name?.toLowerCase().includes(searchTerm) ||
      emp.employeeId?.toLowerCase().includes(searchTerm) ||
      emp.email?.toLowerCase().includes(searchTerm);

    const matchesDepartment =
      !selectedDepartment || emp.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">Employees</h2>
          <p className="text-gray-500 text-sm">
            {filteredEmployees.length} total employees
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEmployee(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Employee
        </button>

      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="relative md:col-span-2">

          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by name, employee ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">Employee</th>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">Department</th>
              <th className="text-left px-6 py-3">Email</th>

              {/* ✅ NEW COLUMN */}
              <th className="text-left px-6 py-3">Phone</th>

              <th className="text-right px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-6 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : filteredEmployees.map((emp) => (

              <tr
                key={emp._id}
                className="border-t hover:bg-gray-50"
              >

                <td className="px-6 py-4 font-medium">
                  {emp.name}
                </td>

                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {emp.employeeId}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {emp.department}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {emp.email}
                </td>

                {/* ✅ SHOW PHONE */}
                <td className="px-6 py-4 text-gray-600">
                  {emp.phone}
                </td>

                <td className="px-6 py-4 flex justify-end gap-3">

                  <button
                    onClick={() => {
                      setEditingEmployee(emp);
                      setModalOpen(true);
                    }}
                    className="text-gray-500 hover:text-black"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleSubmit}
        editingEmployee={editingEmployee}
      />

    </div>
  );
};

export default Employees;
