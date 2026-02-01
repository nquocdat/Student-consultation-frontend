import { Routes, Route, Navigate } from "react-router-dom"; // ❌ Bỏ BrowserRouter ở đây

// --- AUTH & PUBLIC ---
import Login from "./pages/login/Login";
import ForgotPassword from "./components/ForgotPassword";
import Maintenance from "./pages/Maintenance"; // ✅ THÊM IMPORT NÀY

// --- STUDENT IMPORTS ---
import StudentLayout from "./components/student/StudentLayout";
import CreateConsultation from "./pages/student/CreateConsultation";
import ConsultationHistory from "./pages/student/ConsultationHistory";
import StudentProfile from "./pages/student/StudentProfile";
import LecturerDetail from "./pages/lecturer/LecturerDetail";
import StudentProcedureCatalog from "./components/student/StudentProcedureCatalog";
import StudentProcedureCreate from "./components/student/StudentProcedureCreate";
import StudentProcedureHistory from "./components/student/StudentProcedureHistory";
import StudentNotifications from "./pages/student/StudentNotifications";

// --- LECTURER IMPORTS ---
import LecturerLayout from "./components/lecturer/LecturerLayout";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerAppointments from "./pages/lecturer/LecturerAppointments";
import LecturerProfile from "./pages/lecturer/LecturerProfile";
import LecturerSchedule from "./pages/lecturer/LecturerSchedule";
import LecturerStatistics from "./pages/lecturer/LecturerStatistics";
import LecturerNotifications from "./pages/lecturer/LecturerNotifications";

// --- STAFF IMPORTS ---
import StaffLayout from "./components/staff/StaffLayout";
import StaffProcedureManager from "./pages/staff/StaffProcedureManager";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffNotifications from "./pages/staff/StaffNotifications";

// --- ADMIN IMPORTS ---
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserManager from "./pages/admin/AdminUserManager";
import AdminProcedureManager from "./pages/admin/AdminProcedureManager";
import AdminAppointmentManager from "./pages/admin/AdminAppointmentManager";
import AdminLecturerSchedule from "./pages/admin/AdminLecturerSchedule";
import AdminSingleLecturerSchedule from "./pages/admin/AdminSingleLecturerSchedule";
import AdminRequestManager from "./pages/admin/AdminRequestManager";
import AdminStatistics from "./pages/admin/AdminStatistics";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogs from "./pages/admin/AdminLogs";

function App() {
  return (
    // ❌ Đã xóa <BrowserRouter> vì nó đã nằm bên index.js rồi
    <Routes>
      {/* ======================================================= */}
      {/* PUBLIC ROUTES                                         */}
      {/* ======================================================= */}
      {/* Mặc định vào gốc thì chuyển hướng đến trang đăng nhập */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* ✅ THÊM ROUTE BẢO TRÌ VÀO ĐÂY */}
      <Route path="/maintenance" element={<Maintenance />} />

      {/* ======================================================= */}
      {/* 1. STUDENT SECTION                                      */}
      {/* ======================================================= */}
      <Route path="/student" element={<StudentLayout />}>
        {/* Mặc định vào /student -> chuyển sang tạo yêu cầu */}
        <Route index element={<Navigate to="create-request" replace />} />

        {/* Tư vấn giảng viên */}
        <Route path="create-request" element={<CreateConsultation />} />
        <Route path="history" element={<ConsultationHistory />} />
        <Route path="lecturer-info/:id" element={<LecturerDetail />} />

        {/* Thủ tục hành chính */}
        <Route path="procedures/catalog" element={<StudentProcedureCatalog />} />
        <Route path="procedures/create" element={<StudentProcedureCreate />} />
        <Route path="procedures/history" element={<StudentProcedureHistory />} />

        <Route path="notifications" element={<StudentNotifications />} />

        {/* Cá nhân */}
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* ======================================================= */}
      {/* 2. LECTURER SECTION                                     */}
      {/* ======================================================= */}
      <Route path="/lecturer" element={<LecturerLayout />}>
        {/* Mặc định vào /lecturer -> chuyển sang dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<LecturerDashboard />} />
        <Route path="appointments" element={<LecturerAppointments />} />
        <Route path="schedule" element={<LecturerSchedule />} />
        <Route path="statistics" element={<LecturerStatistics />} />
        <Route path="profile" element={<LecturerProfile />} />
        <Route path="notifications" element={<LecturerNotifications />} />
      </Route>

      {/* ======================================================= */}
      {/* 3. STAFF SECTION                                        */}
      {/* ======================================================= */}
      <Route path="/staff" element={<StaffLayout />}>
        {/* Mặc định vào /staff -> chuyển sang quản lý thủ tục */}
        <Route index element={<Navigate to="procedures" replace />} />

        <Route path="procedures" element={<StaffProcedureManager />} />
        <Route path="profile" element={<StaffProfile />} />
        <Route path="notifications" element={<StaffNotifications />} />
      </Route>

      {/* ======================================================= */}
      {/* 4. ADMIN SECTION (FULL CONTROL)                         */}
      {/* ======================================================= */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Mặc định vào /admin -> chuyển sang dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUserManager />} />
        <Route path="procedures" element={<AdminProcedureManager />} />
        <Route path="appointments" element={<AdminAppointmentManager />} />
        <Route path="requests" element={<StaffProcedureManager />} />
        <Route path="lecturer-schedules" element={<AdminLecturerSchedule />} />
        <Route path="lecturer-schedules/:lecturerId" element={<AdminSingleLecturerSchedule />} />
        <Route path="procedure-requests" element={<AdminRequestManager />} />
        <Route path="statistics" element={<AdminStatistics />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>

      {/* ======================================================= */}
      {/* 404 NOT FOUND (Tùy chọn)                                */}
      {/* ======================================================= */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;