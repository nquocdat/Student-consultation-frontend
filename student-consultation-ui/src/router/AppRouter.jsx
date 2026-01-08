import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import MyAppointments from "../pages/student/MyAppointments";
import CreateAppointment from "../pages/student/CreateAppointment";
import LecturerAppointments from "../pages/lecturer/LecturerAppointments";
import Login from "../pages/login/Login";
import ConsultationPage from "../pages/student/ConsultationPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* STUDENT - BẮT BUỘC QUA LAYOUT */}
        <Route path="/student/*" element={<StudentLayout />}>
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="create-appointment" element={<CreateAppointment />} />
          <Route path="consultation" element={<ConsultationPage />} />

        </Route>

        {/* LECTURER */}
        <Route path="/lecturer/appointments" element={<LecturerAppointments />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
