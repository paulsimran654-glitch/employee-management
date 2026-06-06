import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";

import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
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
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const departments = Array.from(
    new Set(employees.map((emp) => emp.department).filter(Boolean))
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="page-kicker mb-3">
            <Users size={15} />
            People
          </p>
          <h2 className="page-title">Employees</h2>
          <p className="page-subtitle mt-2">
            {filteredEmployees.length} total employees
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingEmployee(null);
            setModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={17} />
          Add Employee
        </button>
      </div>

      <section className="glass-panel-strong p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search
              size={19}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]"
            />

            <input
              type="text"
              placeholder="Search by name, employee ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-field pl-10"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="form-field"
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="glass-panel-strong overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#ede9fe] font-black text-[#6d28d9]">
                          {emp.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <span className="font-black text-[#16123a]">{emp.name}</span>
                      </div>
                    </td>

                    <td>
                      <span className="status-badge status-info">{emp.employeeId}</span>
                    </td>

                    <td>{emp.department}</td>
                    <td className="text-[#635f86]">{emp.email}</td>
                    <td className="text-[#635f86]">{emp.phone}</td>

                    <td>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEmployee(emp);
                            setModalOpen(true);
                          }}
                          className="icon-button"
                          aria-label={`Edit ${emp.name}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(emp._id)}
                          className="icon-button text-red-600"
                          aria-label={`Delete ${emp.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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
