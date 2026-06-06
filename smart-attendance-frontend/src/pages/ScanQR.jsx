import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { Camera, CheckCircle, QrCode, ScanLine, SwitchCamera } from "lucide-react";

export default function ScanQR() {
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [scannerStarted, setScannerStarted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const startScanner = async (cameraIndex = 0) => {
    if (scannerStarted && scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        console.log("Scanner already stopped");
      }
    }

    try {
      const availableCameras = await Html5Qrcode.getCameras();
      setCameras(availableCameras);

      if (availableCameras.length === 0) {
        setMessage("No cameras found");
        setMessageType("error");
        return;
      }

      const cameraId = availableCameras[cameraIndex]?.id || availableCameras[0].id;
      setCurrentCameraIndex(cameraIndex);

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          await scanner.clear();
          setScannerStarted(false);

          setShowCamera(true);

          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;

          window.scannedQR = decodedText;
        }
      );

      setScannerStarted(true);
      setMessage("");
      setMessageType("");
    } catch (error) {
      console.error("Error starting scanner:", error);
      setMessage("Failed to start camera");
      setMessageType("error");
      setScannerStarted(false);
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) {
      setMessage("Only one camera available");
      setMessageType("warning");
      return;
    }

    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    await startScanner(nextIndex);
  };

  const capturePhoto = async () => {
    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const photo = canvas.toDataURL("image/jpeg");

    video.srcObject.getTracks().forEach((track) => track.stop());

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await axios.post(
          API_ENDPOINTS.ATTENDANCE_SCAN,
          {
            qr: window.scannedQR,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            photo,
          },
          { withCredentials: true }
        );

        setMessage(res.data.message);
        setMessageType("success");
      } catch (err) {
        const errorData = err?.response?.data;

        if (errorData?.leaveType && errorData?.leaveDates) {
          setMessage(
            `${errorData.message}\nLeave Type: ${errorData.leaveType}\nDates: ${errorData.leaveDates}`
          );
          setMessageType("warning");
        } else {
          setMessage(errorData?.message || "Failed");
          setMessageType("error");
        }
      }

      setLoading(false);
      setShowCamera(false);
    });
  };

  const messageClass =
    messageType === "success"
      ? "border-green-200 bg-green-50/85 text-green-800"
      : messageType === "warning"
      ? "border-amber-200 bg-amber-50/85 text-amber-800"
      : "border-red-200 bg-red-50/85 text-red-800";

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker mb-3">
          <ScanLine size={15} />
          Secure Scan
        </p>
        <h1 className="page-title">Scan QR to Mark Attendance</h1>
        <p className="page-subtitle mt-2">
          Scan the live QR code, capture your photo, and submit location-verified attendance.
        </p>
      </div>

      <section className="glass-panel-strong mx-auto flex max-w-3xl flex-col items-center p-5 sm:p-8">
        {!scannerStarted && !showCamera && (
          <button type="button" onClick={() => startScanner()} className="btn btn-primary">
            <QrCode size={18} />
            Start Scanner
          </button>
        )}

        <div className="relative mt-5 w-full max-w-[390px]">
          <div className="rounded-[8px] border border-[#7d69be2e] bg-white/70 p-4">
            <div id="reader" className="mx-auto overflow-hidden rounded-[8px]" style={{ width: "100%" }} />
          </div>

          {scannerStarted && cameras.length > 1 && (
            <button
              type="button"
              onClick={switchCamera}
              className="icon-button absolute right-6 top-6 bg-white"
              title="Switch Camera"
            >
              <SwitchCamera size={22} />
            </button>
          )}
        </div>

        {scannerStarted && cameras.length > 1 && (
          <div className="mt-4 rounded-[8px] border border-[#7d69be2e] bg-white/60 px-3 py-2 text-sm font-bold text-[#635f86]">
            Camera: {currentCameraIndex + 1} of {cameras.length}
          </div>
        )}

        {showCamera && (
          <div className="mt-6 flex w-full max-w-md flex-col items-center">
            <video
              ref={videoRef}
              autoPlay
              className="aspect-video w-full rounded-[8px] border border-[#7d69be2e] bg-black object-cover"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <button
              type="button"
              onClick={capturePhoto}
              className="btn btn-primary mt-4"
            >
              <Camera size={18} />
              Capture & Submit
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#635f86]">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#7c3aed]" />
            Processing...
          </div>
        )}

        {message && (
          <div className={`mt-5 flex w-full max-w-md gap-3 rounded-[8px] border p-4 text-sm font-semibold ${messageClass}`}>
            {messageType === "success" && <CheckCircle className="mt-0.5 shrink-0" size={18} />}
            <div className="whitespace-pre-line">{message}</div>
          </div>
        )}
      </section>
    </div>
  );
}
