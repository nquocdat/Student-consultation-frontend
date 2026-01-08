import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import MyAppointments from "./pages/student/MyAppointments";
import LecturerAppointments from "./pages/lecturer/LecturerAppointments";
import StudentLayout from "./components/StudentLayout";
import ConsultationPage from "./pages/student/ConsultationPage"; // Import ConsultationPage

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
        <Route
          path="/lecturer/appointments"
          element={<LecturerAppointments />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;