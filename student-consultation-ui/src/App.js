import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import MyAppointments from "./pages/student/MyAppointments";
import LecturerAppointments from "./pages/lecturer/LecturerAppointments";
import StudentLayout from "./components/StudentLayout";
import ConsultationPage from "./pages/student/ConsultationPage"; // Import ConsultationPage
import LecturerLayout from "./components/LecturerLayout";
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerProfile from "./pages/lecturer/LecturerProfile";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT → LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/* STUDENT - PHẢI QUA LAYOUT */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="consultation" element={<ConsultationPage />} /> {/* Thêm route này */}
        </Route>

        {/* LECTURER */}
        <Route path="/lecturer" element={<LecturerLayout />}>
          <Route path="dashboard" element={<LecturerDashboard />} />
          <Route path="appointments" element={<LecturerAppointments />} />
           <Route path="profile" element={<LecturerProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;