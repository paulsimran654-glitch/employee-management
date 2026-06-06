import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { AlertCircle, ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setMsg("");
    setError("");

    if (!email) {
      setError("Enter email");
      return;
    }

    if (!email.endsWith("*") && !email.endsWith("@attendify.com")) {
      setError("Use company email only");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(API_ENDPOINTS.AUTH_SEND_OTP, { email });

      setMsg(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setMsg("");
    setError("");

    if (!otp || !newPassword) {
      setError("All fields required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });

      setMsg(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="btn btn-ghost mb-4 pl-0"
        >
          <ArrowLeft size={17} />
          Back to login
        </button>

        <div className="glass-panel-strong p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#6d28d9]">
              <ShieldCheck size={28} />
            </div>
            <h1 className="page-title">Reset password</h1>
            <p className="page-subtitle mt-2">
              {step === 1 ? "Request a one-time code for your account." : "Enter your code and choose a new password."}
            </p>
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <>
                <label className="block">
                  <span className="form-label">Company Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]" size={18} />
                    <input
                      type="email"
                      placeholder="name@attendify.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-field pl-10"
                    />
                  </div>
                </label>

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <label className="block">
                  <span className="form-label">OTP</span>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-field"
                  />
                </label>

                <label className="block">
                  <span className="form-label">New Password</span>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#817aa3]" size={18} />
                    <input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-field pl-10"
                    />
                  </div>
                </label>

                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </>
            )}

            {msg && (
              <div className="rounded-[8px] border border-green-200 bg-green-50/80 p-3 text-center text-sm font-semibold text-green-700">
                {msg}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50/80 p-3 text-sm font-semibold text-red-700">
                <AlertCircle size={17} />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
