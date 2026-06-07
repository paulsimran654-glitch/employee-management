const PDFDocument = require("pdfkit");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Leave = require("../models/Leave");

function parseReportDateRange(startDate, endDate) {
  const range = {};

  if (startDate) {
    range.start = new Date(startDate);
    if (Number.isNaN(range.start.getTime())) {
      return { error: "Invalid startDate" };
    }
  }

  if (endDate) {
    range.end = new Date(endDate);
    if (Number.isNaN(range.end.getTime())) {
      return { error: "Invalid endDate" };
    }
    range.end.setHours(23, 59, 59, 999);
  }

  if (range.start && range.end && range.start > range.end) {
    return { error: "startDate cannot be after endDate" };
  }

  return range;
}

function buildAttendanceDateFilter(range) {
  const dateFilter = {};
  if (range.start) dateFilter.$gte = range.start;
  if (range.end) dateFilter.$lte = range.end;

  return Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};
}

function buildLeaveDateFilter(range) {
  if (range.start && range.end) {
    return {
      startDate: { $lte: range.end },
      endDate: { $gte: range.start }
    };
  }

  if (range.start) {
    return { endDate: { $gte: range.start } };
  }

  if (range.end) {
    return { startDate: { $lte: range.end } };
  }

  return {};
}

function parseTimeToMinutes(time) {
  if (typeof time !== "string") return null;

  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function formatTime(time) {
  return parseTimeToMinutes(time) === null ? "-" : time;
}

function calculateWorkedHours(record) {
  const checkIn = parseTimeToMinutes(record.checkIn);
  const checkOut = parseTimeToMinutes(record.checkOut);

  if (checkIn === null || checkOut === null || checkOut <= checkIn) {
    return null;
  }

  return (checkOut - checkIn) / 60;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function safeText(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function calculateLeaveDays(leave) {
  if (Number.isFinite(leave.totalDays)) {
    return leave.totalDays;
  }

  const start = new Date(leave.startDate);
  const end = new Date(leave.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// ================= GENERATE USER ATTENDANCE REPORT =================
exports.generateUserReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dateRange = parseReportDateRange(startDate, endDate);
    if (dateRange.error) {
      return res.status(400).json({ message: dateRange.error });
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      employee: userId,
      ...buildAttendanceDateFilter(dateRange)
    }).sort({ date: -1 });

    // Fetch leave records
    const leaveRecords = await Leave.find({
      employee: userId,
      status: "approved",
      ...buildLeaveDateFilter(dateRange)
    }).sort({ startDate: -1 });

    // Calculate statistics
    const stats = calculateStats(attendanceRecords, leaveRecords);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-report-${user.employeeId}-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    generatePDFContent(doc, user, attendanceRecords, leaveRecords, stats, startDate, endDate);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GENERATE ADMIN REPORT (ALL USERS) =================
exports.generateAdminReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = parseReportDateRange(startDate, endDate);
    if (dateRange.error) {
      return res.status(400).json({ message: dateRange.error });
    }

    // Fetch all employees
    const employees = await User.find({ role: "employee" }).sort({ employeeId: 1 });

    // Fetch all attendance records
    const attendanceRecords = await Attendance.find({
      ...buildAttendanceDateFilter(dateRange)
    }).populate("employee", "name employeeId department");

    // Fetch all leave records
    const leaveRecords = await Leave.find({
      status: "approved",
      ...buildLeaveDateFilter(dateRange)
    }).populate("employee", "name employeeId department");

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance-report-all-employees-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Generate PDF content
    generateAdminPDFContent(doc, employees, attendanceRecords, leaveRecords, startDate, endDate);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Admin report generation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= HELPER: CALCULATE STATISTICS =================
function calculateStats(attendanceRecords, leaveRecords) {
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === "present").length;
  const absentDays = attendanceRecords.filter(r => r.status === "absent").length;
  const halfDays = attendanceRecords.filter(r => r.status === "half-day").length;
  const leaveDays = leaveRecords.reduce((sum, leave) => sum + calculateLeaveDays(leave), 0);

  // Calculate total working hours
  const workedHours = attendanceRecords
    .map(calculateWorkedHours)
    .filter(hours => Number.isFinite(hours));
  const totalHours = workedHours.reduce((sum, hours) => sum + hours, 0);

  // Calculate average working hours
  const avgHours = workedHours.length > 0 ? (totalHours / workedHours.length).toFixed(2) : "0.00";

  // Calculate late check-ins (after 9:30 AM)
  const lateCheckIns = attendanceRecords.filter(r => {
    if (r.status === "late") return true;

    const checkIn = parseTimeToMinutes(r.checkIn);
    return checkIn !== null && checkIn > 9 * 60 + 30;
  }).length;

  return {
    totalDays,
    presentDays,
    absentDays,
    halfDays,
    leaveDays,
    totalHours: Number.isFinite(totalHours) ? totalHours.toFixed(2) : "0.00",
    avgHours,
    lateCheckIns
  };
}

// ================= HELPER: GENERATE PDF CONTENT =================
function generatePDFContent(doc, user, attendanceRecords, leaveRecords, stats, startDate, endDate) {
  // Header
  doc.fontSize(20).font("Helvetica-Bold").text("ATTENDANCE REPORT", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
  doc.moveDown(1);

  // Employee Information
  doc.fontSize(14).font("Helvetica-Bold").text("Employee Information");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  doc.text(`Name: ${safeText(user.name)}`);
  doc.text(`Employee ID: ${safeText(user.employeeId)}`);
  doc.text(`Email: ${safeText(user.email)}`);
  doc.text(`Department: ${safeText(user.department)}`);
  doc.text(`Phone: ${safeText(user.phone)}`);
  
  if (startDate || endDate) {
    doc.moveDown(0.5);
    doc.text(`Report Period: ${startDate ? formatDate(startDate) : "Start"} to ${endDate ? formatDate(endDate) : "End"}`);
  }
  
  doc.moveDown(1);

  // Statistics Summary
  doc.fontSize(14).font("Helvetica-Bold").text("Attendance Summary");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  
  const summaryData = [
    ["Total Days Recorded:", stats.totalDays],
    ["Present Days:", stats.presentDays],
    ["Absent Days:", stats.absentDays],
    ["Half Days:", stats.halfDays],
    ["Approved Leaves:", stats.leaveDays],
    ["Total Working Hours:", `${stats.totalHours} hrs`],
    ["Average Hours/Day:", `${stats.avgHours} hrs`],
    ["Late Check-ins:", stats.lateCheckIns]
  ];

  summaryData.forEach(([label, value]) => {
    doc.text(`${label} ${value}`);
  });

  doc.moveDown(1);

  // Attendance Records Table
  if (attendanceRecords.length > 0) {
    doc.fontSize(14).font("Helvetica-Bold").text("Attendance Records");
    doc.moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const colWidths = [80, 80, 80, 80, 60, 80];
    const headers = ["Date", "Check In", "Check Out", "Hours", "Status", "Photo"];

    doc.fontSize(9).font("Helvetica-Bold");
    headers.forEach((header, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, tableTop, { width: colWidths[i], align: "left" });
    });

    doc.moveDown(0.5);
    doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.fontSize(8).font("Helvetica");
    attendanceRecords.forEach((record, index) => {
      const rowY = doc.y;

      // Check if we need a new page
      if (rowY > 700) {
        doc.addPage();
        doc.fontSize(9).font("Helvetica-Bold");
        headers.forEach((header, i) => {
          const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.text(header, x, doc.y, { width: colWidths[i], align: "left" });
        });
        doc.moveDown(0.5);
        doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(8).font("Helvetica");
      }

      const workedHours = calculateWorkedHours(record);
      const rowData = [
        formatDate(record.date),
        formatTime(record.checkIn),
        formatTime(record.checkOut),
        workedHours === null ? "-" : `${workedHours.toFixed(1)}h`,
        safeText(record.status),
        record.photo ? "Yes" : "No"
      ];

      rowData.forEach((data, i) => {
        const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(data, x, rowY, { width: colWidths[i], align: "left" });
      });

      doc.moveDown(0.8);
    });
  }

  // Leave Records
  if (leaveRecords.length > 0) {
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("Approved Leave Records");
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");
    leaveRecords.forEach((leave, index) => {
      const start = formatDate(leave.startDate);
      const end = formatDate(leave.endDate);
      const days = calculateLeaveDays(leave);
      
      doc.text(`${index + 1}. ${safeText(leave.leaveType)} (${days} day${days === 1 ? "" : "s"})`);
      doc.fontSize(9);
      doc.text(`   Period: ${start} to ${end}`, { indent: 20 });
      doc.text(`   Reason: ${safeText(leave.reason)}`, { indent: 20 });
      doc.moveDown(0.5);
      doc.fontSize(10);
    });
  }

  // Footer
  doc.fontSize(8).font("Helvetica").text(
    "This is a computer-generated report. No signature required.",
    50,
    doc.page.height - 50,
    { align: "center" }
  );
}

// ================= HELPER: GENERATE ADMIN PDF CONTENT =================
function generateAdminPDFContent(doc, employees, attendanceRecords, leaveRecords, startDate, endDate) {
  // Header
  doc.fontSize(20).font("Helvetica-Bold").text("COMPANY ATTENDANCE REPORT", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica").text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
  
  if (startDate || endDate) {
    doc.text(`Report Period: ${startDate ? formatDate(startDate) : "Start"} to ${endDate ? formatDate(endDate) : "End"}`, { align: "center" });
  }
  
  doc.moveDown(1);

  // Overall Statistics
  doc.fontSize(14).font("Helvetica-Bold").text("Overall Statistics");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  doc.text(`Total Employees: ${employees.length}`);
  doc.text(`Total Attendance Records: ${attendanceRecords.length}`);
  doc.text(`Total Approved Leaves: ${leaveRecords.length}`);
  doc.moveDown(1);

  // Employee-wise Summary
  doc.fontSize(14).font("Helvetica-Bold").text("Employee-wise Summary");
  doc.moveDown(0.5);

  employees.forEach((employee, index) => {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
    }

    const empAttendance = attendanceRecords.filter(r => 
      r.employee && r.employee._id.toString() === employee._id.toString()
    );
    
    const empLeaves = leaveRecords.filter(l => 
      l.employee && l.employee._id.toString() === employee._id.toString()
    );

    const empStats = calculateStats(empAttendance, empLeaves);

    doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. ${safeText(employee.name)} (${safeText(employee.employeeId)})`);
    doc.fontSize(9).font("Helvetica");
    doc.text(`   Department: ${safeText(employee.department)}`);
    doc.text(`   Present: ${empStats.presentDays} | Absent: ${empStats.absentDays} | Half-day: ${empStats.halfDays} | Leaves: ${empStats.leaveDays}`);
    doc.text(`   Total Hours: ${empStats.totalHours} hrs | Avg: ${empStats.avgHours} hrs/day | Late: ${empStats.lateCheckIns}`);
    doc.moveDown(0.8);
  });

  // Footer
  doc.fontSize(8).font("Helvetica").text(
    "This is a computer-generated report. No signature required.",
    50,
    doc.page.height - 50,
    { align: "center" }
  );
}
