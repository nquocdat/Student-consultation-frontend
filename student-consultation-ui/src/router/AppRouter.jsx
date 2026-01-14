import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import Login from "../pages/login/Login";

// 👇 1. IMPORT 2 TRANG MỚI BẠN VỪA TẠO
import CreateConsultation from "../pages/student/CreateConsultation";
import ConsultationHistory from "../pages/student/ConsultationHistory";

// (Các import cũ khác...)
import MyAppointments from "../pages/student/MyAppointments";
import LecturerAppointments from "../pages/lecturer/LecturerAppointments";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Redirect trang chủ về login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* STUDENT - BẮT BUỘC QUA LAYOUT */}
        <Route path="/student/*" element={<StudentLayout />}>
          
          {/* 👇 2. THÊM 2 ROUTE MỚI NÀY */}
          <Route path="create-request" element={<CreateConsultation />} />
          <Route path="history" element={<ConsultationHistory />} />

          {/* Các route cũ (nếu còn dùng) */}
          <Route path="appointments" element={<MyAppointments />} />
          
          {/* Mặc định khi vào /student thì chuyển hướng sang trang tạo yêu cầu */}
          <Route index element={<Navigate to="create-request" replace />} />

        </Route>

        {/* LECTURER */}
        <Route path="/lecturer/appointments" element={<LecturerAppointments />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;