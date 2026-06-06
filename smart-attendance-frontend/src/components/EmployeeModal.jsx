import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const getInitialForm = (editingEmployee) => ({
  name: editingEmployee?.name || "",
  email: editingEmployee?.email || "",
  phone: editingEmployee?.phone || "",
  department: editingEmployee?.department || "",
  password: "",
});

const EmployeeModalContent = ({ onClose, onSubmit, editingEmployee }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(editingEmployee));

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setForm({
          ...form,
          phone: numericValue,
        });
      }
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(form.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="modal-scrim">
      <div className="modal-card max-w-lg p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#6d28d9]">
            <UserPlus size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#16123a]">
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <p className="text-sm font-semibold text-[#635f86]">
              {editingEmployee ? "Update employee details." : "Create a new employee account."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="form-label">Name</span>
            <input
              name="name"
              placeholder="Employee name"
              value={form.name}
              onChange={handleChange}
              className="form-field"
              required
            />
          </label>

          <label className="block">
            <span className="form-label">Email</span>
            <input
              name="email"
              type="email"
              placeholder="employee@company.com"
              value={form.email}
              onChange={handleChange}
              className="form-field"
              required
            />
          </label>

          <label className="block">
            <span className="form-label">Phone</span>
            <input
              name="phone"
              placeholder="10 digit phone number"
              value={form.phone}
              onChange={handleChange}
              className="form-field"
              maxLength={10}
              inputMode="numeric"
              required
            />
          </label>

          <label className="block">
            <span className="form-label">Department</span>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="form-field"
              required
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </label>

          {!editingEmployee && (
            <label className="block">
              <span className="form-label">Temporary Password</span>
              <div className="relative">
                <input
                  name="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="form-field pr-12"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[8px] text-[#635f86] hover:bg-[#ede9fe]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#817aa3]">
                Temporary password for employee login.
              </p>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              {editingEmployee ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeModal = ({ isOpen, onClose, onSubmit, editingEmployee }) => {
  if (!isOpen) return null;

  return (
    <EmployeeModalContent
      key={editingEmployee?._id || "new-employee"}
      onClose={onClose}
      onSubmit={onSubmit}
      editingEmployee={editingEmployee}
    />
  );
};

export default EmployeeModal;
