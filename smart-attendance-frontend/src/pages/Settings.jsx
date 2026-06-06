import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  getAttendanceTimes,
  getGeofenceConfig,
  getLeaveDefaults,
  updateAttendanceTimes,
  updateGeofenceConfig,
  updateLeaveDefaults,
} from "../api/settingsApi";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [geofence, setGeofence] = useState({
    officeLat: "",
    officeLng: "",
    allowedRadius: "",
  });

  const [times, setTimes] = useState({
    checkinStart: "",
    checkinEnd: "",
    checkoutStart: "",
    checkoutEnd: "",
    lateThreshold: "",
  });

  const [leaveDefaults, setLeaveDefaults] = useState({
    casual: "",
    sick: "",
    annual: "",
    emergency: "",
    maternity: "",
    paternity: "",
    other: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const geofenceRes = await getGeofenceConfig();
      if (geofenceRes.success) {
        setGeofence(geofenceRes.data);
      }

      const timesRes = await getAttendanceTimes();
      if (timesRes.success) {
        setTimes(timesRes.data);
      }

      const leaveRes = await getLeaveDefaults();
      if (leaveRes.success) {
        setLeaveDefaults(leaveRes.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser",
      });
      return;
    }

    setGettingLocation(true);
    setMessage({ type: "", text: "" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeofence({
          ...geofence,
          officeLat: latitude.toString(),
          officeLng: longitude.toString(),
        });
        setMessage({
          type: "success",
          text: `Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
        setGettingLocation(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setMessage({
          type: "error",
          text: errorMessage,
        });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const openLocationOnMap = () => {
    const lat = parseFloat(geofence.officeLat);
    const lng = parseFloat(geofence.officeLng);

    if (isNaN(lat) || isNaN(lng)) {
      setMessage({
        type: "error",
        text: "Please enter valid latitude and longitude first",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
    window.open(mapsUrl, "_blank");
  };

  const handleLeaveDefaultsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateLeaveDefaults(leaveDefaults);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Leave defaults updated successfully!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update leave defaults",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGeofenceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateGeofenceConfig({
        officeLat: parseFloat(geofence.officeLat),
        officeLng: parseFloat(geofence.officeLng),
        allowedRadius: parseInt(geofence.allowedRadius),
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: "Geofence settings updated successfully!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update geofence settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTimesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await updateAttendanceTimes(times);

      if (response.success) {
        setMessage({
          type: "success",
          text: "Attendance times updated successfully!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update attendance times",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel-strong p-8 text-center text-sm font-bold text-[#635f86]">
        Loading settings...
      </div>
    );
  }

  const leaveFields = [
    ["casual", "Casual Leave"],
    ["sick", "Sick Leave"],
    ["annual", "Annual Leave"],
    ["emergency", "Emergency Leave"],
    ["maternity", "Maternity Leave"],
    ["paternity", "Paternity Leave"],
    ["other", "Other Leave"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <SettingsIcon size={15} />
          Controls
        </p>
        <h2 className="page-title">System Settings</h2>
        <p className="page-subtitle mt-2">
          Configure geofence, attendance windows, and leave defaults.
        </p>
      </div>

      {message.text && (
        <div
          className={`flex items-center gap-2 rounded-[8px] border p-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-green-200 bg-green-50/85 text-green-800"
              : "border-red-200 bg-red-50/85 text-red-800"
          }`}
        >
          <AlertCircle className="h-5 w-5" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel-strong p-6">
          <div className="mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#6d28d9]" />
            <h3 className="section-title">Geofence Settings</h3>
          </div>

          <form onSubmit={handleGeofenceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="btn btn-primary"
              >
                <Navigation className="h-4 w-4" />
                {gettingLocation ? "Getting..." : "Use Current"}
              </button>

              <button type="button" onClick={openLocationOnMap} className="btn btn-secondary">
                <ExternalLink className="h-4 w-4" />
                Check on Map
              </button>
            </div>

            <label className="block">
              <span className="form-label">Office Latitude</span>
              <input
                type="number"
                step="any"
                value={geofence.officeLat}
                onChange={(e) => setGeofence({ ...geofence, officeLat: e.target.value })}
                className="form-field"
                placeholder="26.133402482129057"
                required
              />
              <p className="mt-1 text-xs font-semibold text-[#817aa3]">Valid range: -90 to 90</p>
            </label>

            <label className="block">
              <span className="form-label">Office Longitude</span>
              <input
                type="number"
                step="any"
                value={geofence.officeLng}
                onChange={(e) => setGeofence({ ...geofence, officeLng: e.target.value })}
                className="form-field"
                placeholder="91.62278628045627"
                required
              />
              <p className="mt-1 text-xs font-semibold text-[#817aa3]">Valid range: -180 to 180</p>
            </label>

            <label className="block">
              <span className="form-label">Allowed Radius (meters)</span>
              <input
                type="number"
                value={geofence.allowedRadius}
                onChange={(e) => setGeofence({ ...geofence, allowedRadius: e.target.value })}
                className="form-field"
                placeholder="100"
                min="10"
                max="10000"
                required
              />
              <p className="mt-1 text-xs font-semibold text-[#817aa3]">Valid range: 10 to 10,000 meters</p>
            </label>

            <button type="submit" disabled={saving} className="btn btn-primary w-full">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Geofence Settings"}
            </button>
          </form>
        </section>

        <section className="glass-panel-strong p-6">
          <div className="mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-green-700" />
            <h3 className="section-title">Attendance Times</h3>
          </div>

          <form onSubmit={handleTimesSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="form-label">Check-in Start</span>
                <input
                  type="time"
                  value={times.checkinStart}
                  onChange={(e) => setTimes({ ...times, checkinStart: e.target.value })}
                  className="form-field"
                  required
                />
              </label>

              <label className="block">
                <span className="form-label">Check-in End</span>
                <input
                  type="time"
                  value={times.checkinEnd}
                  onChange={(e) => setTimes({ ...times, checkinEnd: e.target.value })}
                  className="form-field"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="form-label">Late Threshold</span>
              <input
                type="time"
                value={times.lateThreshold}
                onChange={(e) => setTimes({ ...times, lateThreshold: e.target.value })}
                className="form-field"
                required
              />
              <p className="mt-1 text-xs font-semibold text-[#817aa3]">
                Employees checking in after this time will be marked as late.
              </p>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="form-label">Check-out Start</span>
                <input
                  type="time"
                  value={times.checkoutStart}
                  onChange={(e) => setTimes({ ...times, checkoutStart: e.target.value })}
                  className="form-field"
                  required
                />
              </label>

              <label className="block">
                <span className="form-label">Check-out End</span>
                <input
                  type="time"
                  value={times.checkoutEnd}
                  onChange={(e) => setTimes({ ...times, checkoutEnd: e.target.value })}
                  className="form-field"
                  required
                />
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary w-full">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Attendance Times"}
            </button>
          </form>
        </section>
      </div>

      <section className="glass-panel-strong p-6">
        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-[#6d28d9]" />
          <h3 className="section-title">Leave Allocation Defaults</h3>
        </div>

        <form onSubmit={handleLeaveDefaultsSubmit} className="space-y-4">
          <p className="text-sm font-semibold text-[#635f86]">
            Set default leave allocations for new employees, in days per year.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {leaveFields.map(([key, label]) => (
              <label key={key} className={key === "other" ? "block sm:col-span-2" : "block"}>
                <span className="form-label">{label}</span>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={leaveDefaults[key]}
                  onChange={(e) => setLeaveDefaults({ ...leaveDefaults, [key]: e.target.value })}
                  className="form-field"
                  required
                />
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary w-full">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Leave Defaults"}
          </button>
        </form>
      </section>

      <section className="glass-panel-strong p-6">
        <h4 className="section-title mb-3">Important Information</h4>
        <ul className="grid gap-3 text-sm font-semibold text-[#635f86] md:grid-cols-2">
          <li className="rounded-[8px] border border-white/70 bg-white/55 p-3">Use Current automatically sets office location to your current GPS position.</li>
          <li className="rounded-[8px] border border-white/70 bg-white/55 p-3">Check on Map opens Google Maps to verify the configured location.</li>
          <li className="rounded-[8px] border border-white/70 bg-white/55 p-3">Leave Defaults are applied to new employees.</li>
          <li className="rounded-[8px] border border-white/70 bg-white/55 p-3">Geofence and attendance time changes take effect immediately.</li>
        </ul>
      </section>
    </div>
  );
};

export default Settings;
