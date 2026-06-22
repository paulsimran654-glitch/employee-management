import { Activity, ArrowRight, MapPin, QrCode, ScanFace, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/attendify-glass-hero.png";

const features = [
  {
    icon: ShieldCheck,
    title: "Anti-Proxy Detection",
    desc: "Face validation and anti-spoof checks help keep check-ins authentic.",
  },
  {
    icon: QrCode,
    title: "QR-Based Attendance",
    desc: "Employees scan dynamic QR codes for fast and secure attendance.",
  },
  {
    icon: MapPin,
    title: "Geo-Location Verification",
    desc: "Location rules confirm check-ins happen inside approved premises.",
  },
  {
    icon: Activity,
    title: "Real-Time Dashboard",
    desc: "Live attendance signals make daily operations easier to monitor.",
  },
];

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <nav className="glass-nav mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
          aria-label="Attendify home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-white text-[#7c3aed] shadow-[0_12px_26px_rgba(124,58,237,0.18)]">
            <ScanFace size={23} />
          </span>
          <span className="text-xl font-black text-[#16123a]">Attendify</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn btn-secondary px-3 sm:px-4"
          >
            <UserRound size={17} />
            <span className="hidden sm:inline">Admin Login</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-4 pb-16 pt-32"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(250,248,255,0.2), rgba(250,248,255,0.72)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#faf8ff] to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="page-kicker mb-6">
          <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
          QR Attendance System
        </div>

        <h1 className="text-6xl font-black leading-none tracking-normal text-[#17123b] drop-shadow-[0_12px_36px_rgba(55,35,105,0.18)] md:text-8xl">
          Attendify
        </h1>

        <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#3b3563] md:text-lg">
          Secure, smart, and reliable attendance tracking using QR, geo-location,
          and anti-proxy validation.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn btn-primary min-w-52"
          >
            Get Started
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/qr-display-public")}
            className="btn btn-secondary min-w-52"
          >
            <QrCode size={18} />
            View QR Display
          </button>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section className="px-4 pb-12 pt-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-black text-[#16123a]">Key Features</h2>
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#7c3aed]" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="glass-card p-6">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[8px] border border-white/70 bg-white/70 text-[#6d28d9] shadow-[0_12px_28px_rgba(76,29,149,0.12)]">
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-black leading-tight text-[#16123a]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-[#635f86]">
                  {feature.desc}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Navbar />
      <Hero />
      <Features />
      <footer className="px-4 pb-8 text-center text-sm font-semibold text-[#635f86]">
        (c) 2026 Attendify. All rights reserved.
      </footer>
    </div>
  );
}
