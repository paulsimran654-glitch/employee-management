import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel-strong px-6 py-4 text-sm font-bold text-[#635f86]">
          Loading secure workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" />;
    }

    if (user.role === "employee") {
      return <Navigate to="/employee/dashboard" />;
    }
  }

  return children;
}
