import QRCode from "react-qr-code";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { Link } from "react-router-dom";
import { Clock3, Home, QrCode, ShieldCheck } from "lucide-react";

export default function QRDisplay() {
  const [qrValue, setQrValue] = useState(null);
  const [message, setMessage] = useState("Loading...");

  const fetchQR = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.QR_CURRENT);
      const data = res.data;

      if (!data.active) {
        setQrValue(null);
        setMessage("QR is not active now");
        return;
      }

      setQrValue(JSON.stringify(data.qr));
      setMessage("");
    } catch (err) {
      console.error("QR fetch error:", err);
      setQrValue(null);
      setMessage("Unable to load QR");
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(fetchQR, 0);
    const interval = window.setInterval(fetchQR, 5000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [fetchQR]);

  return (
    <div className="app-shell flex min-h-screen flex-col px-4 py-6">
      <header className="glass-nav mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-[#7c3aed] shadow-[0_10px_24px_rgba(124,58,237,0.16)]">
            <ShieldCheck size={21} />
          </span>
          <span className="font-black text-[#16123a]">Attendify</span>
        </Link>

        <Link to="/" className="btn btn-secondary px-3">
          <Home size={17} />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center py-10">
        <div className="grid w-full max-w-5xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="text-center lg:text-left">
            <div className="page-kicker mx-auto mb-5 lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
              Display Mode
            </div>
            <h1 className="page-title">Employee Attendance QR</h1>
            <p className="page-subtitle mt-3 max-w-xl">
              Keep this screen visible for employees to scan and mark attendance securely.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-[8px] border border-[#7d69be2e] bg-white/60 px-4 py-3 text-sm font-bold text-[#635f86]">
              <Clock3 size={18} />
              Refreshes every 5 seconds
            </div>
          </section>

          <section className="glass-panel-strong mx-auto flex w-full max-w-md flex-col items-center p-6 sm:p-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#6d28d9]">
              <QrCode size={30} />
            </div>

            <div className="flex min-h-[304px] w-full items-center justify-center rounded-[8px] border border-[#7d69be2e] bg-white p-5">
              {qrValue ? (
                <QRCode value={qrValue} size={260} />
              ) : (
                <p className="text-center text-lg font-bold text-[#635f86]">
                  {message}
                </p>
              )}
            </div>

            <p className="mt-5 text-center text-sm font-semibold text-[#635f86]">
              Scan this QR to mark attendance.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
