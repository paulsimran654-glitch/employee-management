import { useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, LockKeyhole, Mail, QrCode, ShieldCheck } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    if (result.user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/employee/dashboard");
    }
  };

  return (
    <div className="app-shell grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-8 flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-[#7c3aed] shadow-[0_12px_28px_rgba(124,58,237,0.16)]">
              <ShieldCheck size={23} />
            </span>
            <span className="text-xl font-black text-[#16123a]">Attendify</span>
          </button>

          <div className="glass-panel-strong p-6 sm:p-8">
            <div className="mb-7">
              <p className="page-kicker mb-4">
                <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                Secure access
              </p>
              <h1 className="page-title">Welcome back</h1>
              <p className="page-subtitle mt-2">
                Sign in to manage attendance, leave, and reports.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="form-label">Company Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]" size={18} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-field pl-10"
                  />
                </div>
              </label>

              <label className="block">
                <span className="form-label">Password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]" size={18} />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-field pl-10"
                  />
                </div>
              </label>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-bold text-[#6d28d9] hover:text-[#4c1d95]"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50/80 p-3 text-sm font-semibold text-red-700">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden p-8 lg:flex lg:items-center">
        <div className="glass-panel-strong relative z-10 w-full p-8">
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#6d28d9] text-white shadow-[0_18px_40px_rgba(109,40,217,0.28)]">
            <QrCode size={34} />
          </div>
          <h2 className="text-4xl font-black leading-tight text-[#16123a]">
            Secure attendance operations from one polished workspace.
          </h2>
          <div className="mt-8 grid gap-3">
            {["QR validation", "Geofence checks", "Live reporting"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[8px] border border-white/70 bg-white/55 p-3 text-sm font-bold text-[#3b3563]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
