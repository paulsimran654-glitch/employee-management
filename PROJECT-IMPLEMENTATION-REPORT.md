# Smart Attendance Employee Management System - Implementation Report

## 1. Project Overview

The Smart Attendance Employee Management System is a full-stack web application developed to manage employee attendance, employee records, leave requests, leave balances, QR-based attendance marking, geofence validation, and PDF report generation. The project is divided into two main applications:

- `smart-attendance-backend`: Node.js, Express.js, MongoDB, and Mongoose API server.
- `smart-attendance-frontend`: React, Vite, Tailwind CSS, and Axios-based client application.

The system supports two major user roles:

- Admin: manages employees, attendance, leaves, reports, leave balances, and system settings.
- Employee: scans QR codes, marks attendance, views history, applies for leave, and downloads personal reports.

## 2. Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token authentication
- HTTP-only cookie authentication
- bcrypt / bcryptjs password hashing
- node-cron scheduled jobs
- moment-timezone for India time handling
- PDFKit for PDF report generation
- Nodemailer for OTP email support
- QR code-related backend support

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React icons
- html5-qrcode for QR scanning
- React QR Code
- Recharts
- jsPDF / html2canvas support

## 3. System Architecture

The application follows a client-server architecture.

The frontend communicates with the backend through REST API endpoints. Authentication is handled using JWT tokens stored in HTTP-only cookies. MongoDB stores employee data, attendance records, leave applications, QR data, and admin settings.

Main backend layers:

- `server.js`: application entry point, middleware setup, route registration, database connection, and admin seeding.
- `routes/`: API endpoint definitions.
- `controllers/`: business logic for authentication, attendance, admin actions, leave management, reports, QR, and settings.
- `models/`: MongoDB schemas for users, attendance, leaves, QR records, and admin settings.
- `middleware/`: authentication and role-based access control.
- `jobs/`: scheduled attendance automation.

Main frontend layers:

- `src/pages/`: screen-level pages for admin and employee workflows.
- `src/components/`: reusable UI components such as sidebar, topbar, stat cards, protected routes, and modals.
- `src/api/`: centralized API helper functions.
- `src/context/`: authentication context.
- `src/layouts/`: admin and employee layout shells.
- `src/config/api.js`: centralized API endpoint configuration.

## 4. Authentication And Authorization Implementation

The project implements secure login and role-based access.

Implemented features:

- Email and password login.
- Password hashing using bcrypt.
- JWT token generation with user ID and role.
- HTTP-only cookie storage for authentication token.
- Logout by clearing the authentication cookie.
- `/auth/me` endpoint for validating logged-in users.
- Protected frontend routes using `ProtectedRoute`.
- Admin-only middleware using `requireAdmin`.
- Separate route groups for admin and employee users.

Additional authentication feature:

- Forgot password flow using OTP.
- OTP is generated and stored with expiry time.
- OTP can be sent through email using Nodemailer, with console fallback.
- Password reset updates the hashed password and clears OTP data.

## 5. Employee Management Module

The admin can manage employees through a dedicated employee module.

Implemented features:

- View all employees.
- Add new employee.
- Edit employee details.
- Delete employee.
- Search employee by name, employee ID, or email.
- Filter employees by department.
- Automatic employee ID generation using the `EMP001`, `EMP002`, etc. pattern.
- Phone number validation requiring exactly 10 digits.
- Duplicate email validation.
- Password hashing when employee is created.

The frontend provides an employee table, employee modal, search bar, department filter, and action buttons for edit/delete operations.

## 6. Attendance Management Module

Attendance is implemented with QR scanning, photo capture, location validation, and time-window validation.

Implemented features:

- Employee QR scan attendance.
- Check-in and check-out flow.
- Employee attendance history.
- Today's attendance status.
- Admin view of all attendance records.
- Admin manual check-out update with reason.
- Attendance status values: `present`, `late`, `absent`, and `on-leave`.
- One attendance record per employee per date using a unique database index.
- Auto absent marking for employees who do not check in.
- Attendance photo capture and storage under the backend uploads folder.
- Attendance records store location-related fields such as latitude, longitude, distance, geofence status, and denial reason.

Attendance logic uses India timezone through `moment-timezone`.

## 7. QR-Based Attendance Implementation

The QR system supports dynamic attendance marking based on configured attendance time windows.

Implemented features:

- Public QR display endpoint for display screens.
- QR data includes attendance type, mode, and date.
- Check-in QR is active only during configured check-in time.
- Check-out QR is active only during configured check-out time.
- QR is inactive outside valid attendance windows.
- Weekend attendance blocking is implemented unless test mode is enabled.
- Test mode support is available through environment variables.

The frontend employee scan page uses `html5-qrcode` to scan live QR codes, then captures an employee photo and GPS coordinates before submitting attendance.

## 8. Geofence Attendance Validation

Geofence validation ensures employees can mark attendance only from an approved office location.

Implemented features:

- Admin-configurable office latitude.
- Admin-configurable office longitude.
- Admin-configurable allowed radius in meters.
- Haversine formula distance calculation.
- Attendance denied if employee is outside the configured office zone.
- Distance from office is returned in the response.
- Employee scan latitude, longitude, and distance are stored in attendance records.
- Admin settings UI includes "Use Current" and "Check on Map" options.

Validation rules include latitude range, longitude range, and allowed radius range.

## 9. Leave Management Module

The leave module supports employee leave applications and admin review.

Implemented features:

- Employee can apply for leave.
- Employee can view own leave applications.
- Employee can view leave details.
- Employee can cancel pending leave.
- Admin can view all leave applications.
- Admin can approve or reject leave.
- Admin can add review comments.
- Admin can view leave statistics.
- Leave types include sick, casual, annual, maternity, paternity, emergency, and other.
- Overlapping leave applications are prevented.
- Leave cannot be applied for past dates.
- Leave cannot be applied if attendance already exists with check-in for selected dates.
- Approved leave creates attendance records with `on-leave` status.
- Rejected leave can remove generated leave attendance records.

Leave and attendance are integrated, so approved leave appears in attendance history and reports.

## 10. Leave Balance Management

The project includes a dedicated leave balance system.

Implemented features:

- Leave balance stored in the user model.
- Leave balance includes total, used, and remaining counts.
- Supported leave types: casual, sick, annual, emergency, maternity, paternity, other.
- Admin can view leave balance for all employees.
- Admin can search and filter leave balances.
- Admin can edit an employee's leave allocation.
- Admin can reset leave balances for a new year.
- Admin can view leave balance statistics.
- Leave balance is deducted when leave is approved.
- Leave defaults can be configured from system settings.

This module makes the project stronger because it connects leave approval with employee entitlement tracking.

## 11. Report Generation Module

The reporting module generates downloadable PDF reports.

Implemented features:

- Employee-specific attendance report.
- Admin company-wide attendance report.
- Optional date range filtering.
- PDF download from frontend using blob response.
- Employee report includes employee details, attendance summary, working hours, attendance records, photo availability, and approved leave records.
- Admin report includes overall company statistics and employee-wise attendance summary.
- Reports include present days, absent days, leave days, total hours, average hours, and late check-ins.

PDF generation is implemented in the backend using PDFKit.

## 12. Admin Settings Module

The admin settings module makes major attendance and leave rules configurable without changing code.

Implemented settings:

- Office geofence latitude.
- Office geofence longitude.
- Allowed geofence radius.
- Check-in start time.
- Check-in end time.
- Check-out start time.
- Check-out end time.
- Late threshold time.
- Default annual leave allocations.

Settings are stored in MongoDB using the `AdminSettings` model and take effect immediately in attendance and QR logic.

## 13. Dashboard And User Interface Implementation

The frontend includes separate user experiences for admin and employee users.

Admin screens:

- Admin dashboard
- Employee management
- Attendance management
- Leave requests
- Leave balance management
- Reports
- System settings

Employee screens:

- Employee dashboard
- QR scan attendance
- Attendance history
- Leave application
- Personal report

General UI features:

- Role-based routing.
- Admin and employee layouts.
- Sidebar and topbar navigation.
- Reusable stat cards.
- Modal-based employee editing.
- Responsive tables and forms.
- Icon-based actions using Lucide React.

## 14. Database Models

### User Model

Stores employee/admin details, authentication data, role, OTP reset fields, leave balance, and leave balance year.

### Attendance Model

Stores employee attendance by date, check-in, check-out, status, photo, reason, leave mapping, geofence coordinates, distance, and geofence status.

### Leave Model

Stores employee leave applications, leave type, date range, total days, reason, status, reviewer, admin comments, and attachments metadata.

### Admin Settings Model

Stores configurable geofence settings, attendance time windows, late threshold, and leave defaults.

### QR Model

Stores QR-related state used by the live QR display system.

## 15. Scheduled Automation

The backend includes a cron job for automatic attendance processing.

Implemented automation:

- Cron checks attendance settings every minute.
- On weekdays, after the check-in window ends, employees without check-in records are marked absent.
- Existing records without check-in can be converted to absent.
- Weekend days are skipped.
- Test mode can trigger QR and absent logic for development.

## 16. API Endpoint Summary

Main backend API groups:

- `/api/auth`: login, logout, current user, OTP, password reset.
- `/api/admin`: employees, attendance, leave review, leave statistics.
- `/api/attendance`: scan QR, history, today's attendance.
- `/api/qr`: current QR data.
- `/api/leave`: employee leave application and leave history.
- `/api/leave-balance`: employee/admin leave balance operations.
- `/api/settings`: geofence, attendance time, and leave default settings.
- `/api/report`: employee and admin PDF reports.

## 17. Security And Validation

Implemented security features:

- Password hashing.
- JWT authentication.
- HTTP-only cookies.
- Role-based protected routes.
- Admin-only route protection.
- Email uniqueness validation.
- Phone number validation.
- Leave date validation.
- Leave overlap validation.
- Geofence validation.
- Attendance time-window validation.
- Access control for employee reports and leave balance.

Important improvement recommendation:

- The `.env` file contains sensitive secrets and should never be committed or shared. Rotate exposed credentials, keep `.env` in `.gitignore`, and provide only `.env.example` in documentation.

## 18. Testing And Development Support

The project includes helpful development support:

- Backend `npm run dev` with Nodemon.
- Frontend `npm run dev` with Vite.
- Test mode support for attendance time simulation.
- Existing Markdown documentation files for backend and frontend features.
- API testing notes for report endpoints.

Recommended additional testing:

- Add automated backend tests for authentication, attendance scan, leave approval, and report authorization.
- Add frontend tests for protected routes and form validation.
- Add integration tests for leave approval creating attendance records and deducting leave balance.

## 19. Newly Added Report Headings For Project Documentation

These headings can be added to final documentation, presentation, or project file:

- Problem Statement
- Project Objectives
- Scope Of The Project
- Existing System And Limitations
- Proposed System
- System Architecture
- Technology Stack
- Module-Wise Implementation
- Database Design
- API Design
- Authentication And Authorization
- QR Attendance Workflow
- Geofence Validation Workflow
- Leave And Attendance Integration
- Report Generation Workflow
- Admin Settings And Configuration
- Security Measures
- Testing Strategy
- Deployment Configuration
- Limitations
- Future Enhancements
- Conclusion

## 20. Challenges Faced During Implementation

During the development of this project, several practical and technical challenges were faced. These challenges helped improve the final quality of the system and made the project more realistic.

- Integrating role-based access was one of the important challenges because the system needed separate permissions for admin and employee users. Admin users required access to employee records, attendance records, leave approvals, reports, and settings, while employees needed access only to their own dashboard, attendance, leave, and reports.

- Implementing QR-based attendance required careful handling of check-in and check-out time windows. The QR code had to remain active only during valid attendance periods, and the backend needed to reject scans outside the configured time.

- Geofence validation was another major challenge because attendance marking depends on accurate GPS coordinates. The system had to calculate the distance between the employee's current location and the configured office location, then allow or deny attendance based on the allowed radius.

- Managing attendance with leave records required proper integration. When an approved leave is created, the system must reflect it in attendance as `on-leave`, but it also needs to prevent duplicate or conflicting attendance records.

- Leave balance tracking required extra care because leave approval directly affects the employee's available leave count. The system needed to update used and remaining leaves correctly and support different leave types.

- Generating PDF reports was challenging because the report had to include attendance details, working hours, leave records, and employee information in a readable format. Both individual employee reports and company-wide admin reports had to be supported.

- Handling authentication securely was also important. The system uses hashed passwords, JWT tokens, HTTP-only cookies, protected routes, and role-based middleware to reduce unauthorized access.

- Maintaining proper frontend and backend communication required centralized API configuration and consistent response handling. Since the project contains many modules, keeping routes, API calls, and UI states synchronized was an important part of implementation.

- Testing time-based attendance features was difficult because check-in, check-out, late marking, weekends, and auto-absent logic depend on the current date and time. Test mode support helped simulate attendance scenarios during development.

## 21. Future Enhancements

Possible improvements that can be added later:

- Department-wise analytics dashboard.
- Monthly attendance calendar view.
- Email notification for leave approval or rejection.
- Admin audit logs for employee, attendance, leave, and settings changes.
- Export attendance data to Excel or CSV.
- Multi-branch office geofence support.
- Face verification during photo-based attendance.
- Mobile app version for employees.
- Attendance correction request workflow.
- Stronger refresh-token based session management.
- Cloud storage for uploaded attendance photos.
- Automated test suite and CI pipeline.

## 22. Conclusion

The Smart Attendance Employee Management System was successfully implemented as a complete full-stack solution for managing employee attendance, leave, employee records, leave balances, and reports. The project combines modern web technologies with practical workplace requirements such as QR-based attendance, geofence verification, photo capture, role-based access, automatic absent marking, and PDF report generation.

Overall, the system reduces manual attendance work, improves accuracy, and gives both admins and employees a clear platform for daily attendance and leave-related activities. The admin can manage employees, monitor attendance, approve leaves, configure rules, and generate reports, while employees can mark attendance, view history, apply for leave, and download their own reports.

This project demonstrates how automation, authentication, database management, and user-friendly interface design can be combined to build a practical employee management application. It also provides a strong base for future improvements such as advanced analytics, email notifications, mobile application support, and stronger automated testing.
