import { useContext } from "react";
import { AuthContext } from "../context/auth-context";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

export default function Dashboard() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="glass-panel-strong p-6 text-sm font-bold text-[#635f86]">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-panel-strong p-6 text-sm font-bold text-red-700">
        Unauthorized
      </div>
    );
  }

  return user.role === "admin"
    ? <AdminDashboard user={user} logout={logout} />
    : <EmployeeDashboard user={user} logout={logout} />;
}
