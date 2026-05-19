const cron = require("node-cron");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const moment = require("moment-timezone");

const { setQR, clearQR } = require("../controllers/qr.controller");

// =======================
// AUTO ABSENT FUNCTION (FIXED)
// =======================
const markAbsent = async () => {
  try {

    const now = moment().tz("Asia/Kolkata");

    if (now.isoWeekday() > 5) {
      console.log("⏭ Weekend skip");
      return;
    }

    const todayStr = now.format("YYYY-MM-DD");

    const employees = await User.find({ role: "employee" });

    for (const emp of employees) {

      const record = await Attendance.findOne({
        employee: emp._id,
        dateString: todayStr
      });

      if (!record) {
        await Attendance.create({
          employee: emp._id,
          employeeId: emp.employeeId,
          date: now.toDate(),
          dateString: todayStr,
          status: "absent",
          isAutoAbsent: true
        });
        continue;
      }

      if (record.checkIn) continue;

      record.status = "absent";
      record.isAutoAbsent = true;
      await record.save();
    }

    console.log(`✅ Absent marked successfully at ${now.format("HH:mm")}`);

  } catch (err) {
    console.error("❌ Error in markAbsent:", err.message);
  }
};

// =======================
// CRON JOBS (DYNAMIC FROM DB)
// =======================

const AdminSettings = require("../models/AdminSettings");

cron.schedule("* * * * *", async () => {
  try {
    const now = moment().tz("Asia/Kolkata");
    
    // Only run on weekdays
    if (now.isoWeekday() > 5) return;

    const settings = await AdminSettings.findOne({ settingKey: "attendance_times" });
    if (!settings) return;

    const currentMinutes = now.hours() * 60 + now.minutes();
    
    const formatTime = (mins) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    
    console.log(`⏱️  [Cron check] Current time: ${now.format("HH:mm")} (${currentMinutes} mins). DB checkinEnd: ${formatTime(settings.checkinEnd)} (${settings.checkinEnd} mins)`);


    // Trigger absent marking exactly 1 minute after checkinEnd
    if (currentMinutes === settings.checkinEnd + 1) {
      console.log(`⏰ Triggering markAbsent at dynamic checkinEnd + 1 (${currentMinutes} mins)`);
      await markAbsent();
      console.log(`✅ markAbsent routine completed at ${now.format("HH:mm")}`);
    }
  } catch (err) {
    console.error("Cron Job Error:", err.message);
  }
});


// =======================
// ⚡ TEST MODE (FULL FIX)
// =======================
if (process.env.TEST_MODE === "true") {

  setTimeout(async () => {

    console.log("⚡ TEST MODE ACTIVE");

    const now = moment().tz("Asia/Kolkata");
    const testTime = process.env.TEST_TIME;

    if (!testTime) return;

    const [hour, minute] = testTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;

    const CHECKIN_START = 8 * 60 + 45;
    const CHECKIN_END = 9 * 60 + 30;

    const CHECKOUT_START = 16 * 60 + 45;
    const CHECKOUT_END = 17 * 60 + 30;

    // ================= QR LOGIC =================

    // 🟢 CHECK-IN WINDOW
    if (totalMinutes >= CHECKIN_START && totalMinutes <= CHECKIN_END) {

      await setQR({
        type: "attendance",
        mode: "checkin",
        date: now.format("YYYY-MM-DD")
      });

      console.log("⚡ TEST: Check-in QR active");
    }

    // 🔵 CHECK-OUT WINDOW
    else if (totalMinutes >= CHECKOUT_START && totalMinutes <= CHECKOUT_END) {

      await setQR({
        type: "attendance",
        mode: "checkout",
        date: now.format("YYYY-MM-DD")
      });

      console.log("⚡ TEST: Check-out QR active");
    }

    // ❌ OUTSIDE WINDOW → CLEAR QR
    else {

      await clearQR();
      console.log("⚡ TEST: QR cleared (outside window)");
    }

    // ================= ABSENT TEST =================
    if (process.env.TEST_ABSENT === "true") {
      console.log("⚡ TEST: Running absent marking manually");
      await markAbsent();
    }

  }, 3000);
}