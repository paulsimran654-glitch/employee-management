import { useEffect, useState } from "react";
import { AlertCircle, MapPin, RefreshCw, Save } from "lucide-react";
import { getGeofenceConfig, updateGeofenceConfig } from "../api/geofenceApi";

const GeofenceSettings = () => {
  const [config, setConfig] = useState({
    officeLat: 26.133402482129057,
    officeLng: 91.62278628045627,
    allowedRadius: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await getGeofenceConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error("Error fetching geofence config:", error);
      setMessage({ type: "error", text: "Failed to load configuration" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await updateGeofenceConfig(config);

      if (response.success) {
        setMessage({ type: "success", text: "Geofence configuration updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error updating geofence config:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  if (loading) {
    return (
      <div className="glass-panel-strong p-8 text-center text-sm font-bold text-[#635f86]">
        Loading geofence settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="page-kicker mb-3">
            <MapPin size={15} />
            Location Rules
          </p>
          <h1 className="page-title">Geofence Settings</h1>
          <p className="page-subtitle mt-2">
            Configure office location and attendance radius.
          </p>
        </div>
        <button type="button" onClick={fetchConfig} className="btn btn-secondary">
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-[8px] border p-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-green-200 bg-green-50/85 text-green-800"
              : "border-red-200 bg-red-50/85 text-red-800"
          }`}
        >
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      <section className="glass-panel-strong p-6">
        <div className="space-y-5">
          <label className="block">
            <span className="form-label">Office Latitude</span>
            <input
              type="number"
              step="0.000001"
              value={config.officeLat}
              onChange={(e) => handleInputChange("officeLat", e.target.value)}
              className="form-field"
              placeholder="26.133402482129057"
            />
            <p className="mt-1 text-xs font-semibold text-[#817aa3]">Valid range: -90 to 90</p>
          </label>

          <label className="block">
            <span className="form-label">Office Longitude</span>
            <input
              type="number"
              step="0.000001"
              value={config.officeLng}
              onChange={(e) => handleInputChange("officeLng", e.target.value)}
              className="form-field"
              placeholder="91.62278628045627"
            />
            <p className="mt-1 text-xs font-semibold text-[#817aa3]">Valid range: -180 to 180</p>
          </label>

          <label className="block">
            <span className="form-label">Allowed Radius (meters)</span>
            <input
              type="number"
              step="10"
              value={config.allowedRadius}
              onChange={(e) => handleInputChange("allowedRadius", e.target.value)}
              className="form-field"
              placeholder="100"
            />
            <p className="mt-1 text-xs font-semibold text-[#817aa3]">Valid range: 10 to 10000 meters</p>
          </label>

          <div className="rounded-[8px] border border-blue-200 bg-blue-50/80 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-blue-700" size={20} />
              <div className="flex-1 text-sm font-semibold text-blue-900">
                <h3 className="mb-2 font-black">Current Configuration</h3>
                <p><strong>Location:</strong> {config.officeLat.toFixed(6)}, {config.officeLng.toFixed(6)}</p>
                <p><strong>Radius:</strong> {config.allowedRadius} meters ({(config.allowedRadius / 1000).toFixed(2)} km)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </section>

      <section className="glass-panel-strong p-6">
        <h3 className="section-title mb-3">About Geofence Validation</h3>
        <div className="space-y-3 text-sm font-semibold text-[#635f86]">
          <p>Geofencing ensures employees can only mark attendance when physically present at the office location.</p>
          <p>When an employee scans the QR code, GPS location is compared with the office coordinates and allowed radius.</p>
          <p className="font-black text-red-700">Changes take effect immediately for all employees.</p>
        </div>
      </section>
    </div>
  );
};

export default GeofenceSettings;
