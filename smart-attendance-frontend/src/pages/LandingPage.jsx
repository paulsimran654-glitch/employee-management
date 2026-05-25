import React from "react";
import { Activity, MapPin, ShieldCheck, ScanFace, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0f172a]/90 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <ScanFace size={20} />
          Attendify
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/qr-display-public")}
            className="flex items-center gap-2 bg-transparent border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition"
          >
            <QrCode size={18} />
            QR Display
          </button>

          <button
            onClick={() => navigate("/login")}
            className="bg-[#1e293b] text-white px-4 py-2 rounded-lg hover:bg-[#334155] transition"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center text-center text-white px-4 bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      <div className="mt-20">
        <div className="inline-block mb-4 px-4 py-1 text-sm bg-white/10 rounded-full border border-white/20">
          QR Attendance System
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Attendify
        </h1>

        <p className="max-w-2xl mx-auto text-gray-300 mb-6">
          Secure, smart, and reliable attendance tracking using QR, geo-location,
          and anti-proxy validation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-[#0f172a] px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/qr-display-public")}
            className="flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
          >
            <QrCode size={20} />
            View QR Display
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-center">
      <div className="flex justify-center mb-3 text-[#1e293b]">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2 text-[#0f172a]">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
};

const Features = () => {
  return (
    <div className="py-14 bg-linear-to-b from-[#f1f5f9] to-[#e2e8f0] px-6">
      <h2 className="text-center text-2xl font-bold mb-10 text-[#0f172a]">
        Key Features
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
        <FeatureCard
          icon={<ShieldCheck />}
          title="Anti-Proxy Detection"
          desc="Prevent fake attendance using live face validation and anti-spoof detection."
        />

        <FeatureCard
          icon={<QrCode />}
          title="QR-Based Attendance"
          desc="Employees scan dynamic QR codes for fast and secure attendance marking."
        />

        <FeatureCard
          icon={<MapPin />}
          title="Geo-Location Verification"
          desc="Ensure employees are within office premises using location-based validation."
        />

        <FeatureCard
          icon={<Activity />}
          title="Real-Time Dashboard"
          desc="Monitor attendance data live with instant updates and actionable insights."
        />
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="bg-white py-4 text-center text-sm text-gray-500">
      © 2026 Attendify. All rights reserved.
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="font-[Poppins]">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
