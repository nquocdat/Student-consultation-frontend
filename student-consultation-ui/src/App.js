import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";

// 👇 IMPORT 2 TRANG MỚI BẠN VỪA TẠO
import CreateConsultation from "./pages/student/CreateConsultation";
import ConsultationHistory from "./pages/student/ConsultationHistory";

import StudentLayout from "./components/StudentLayout";
import LecturerAppointments from "./pages/lecturer/LecturerAppointments";
import LecturerLayout from "./components/lecturer/LecturerLayout";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerProfile from "./pages/lecturer/LecturerProfile";
import StudentProfile from "./pages/student/StudentProfile";
import ForgotPassword from "./components/ForgotPassword";
import LecturerDetail from "./pages/lecturer/LecturerDetail";
import LecturerSchedule from "./pages/lecturer/LecturerSchedule";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT → LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ======================================================= */}
        {/* STUDENT - PHẢI QUA LAYOUT                               */}
        {/* ======================================================= */}
        <Route path="/student" element={<StudentLayout />}>
          
          {/* 👇 1. MENU: Tạo yêu cầu tư vấn */}
          <Route path="create-request" element={<CreateConsultation />} />

          {/* 👇 2. MENU: Xem kết quả xử lý */}
          <Route path="history" element={<ConsultationHistory />} />
          
          {/* Mặc định: Nếu vào /student thì chuyển hướng luôn sang trang Tạo yêu cầu */}
          <Route index element={<Navigate to="create-request" replace />} />
          {/* 👇 THÊM ROUTE PROFILE */}
          <Route path="profile" element={<StudentProfile />} />
          <Route path="lecturer-info/:id" element={<LecturerDetail />} />
           
          
        </Route>

        {/* ======================================================= */}
        {/* LECTURER                                                */}
        {/* ======================================================= */}
        <Route path="/lecturer" element={<LecturerLayout />}>
          <Route path="dashboard" element={<LecturerDashboard />} />
          <Route path="appointments" element={<LecturerAppointments />} />
           <Route path="profile" element={<LecturerProfile />} />
           <Route path="schedule" element={<LecturerSchedule />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;