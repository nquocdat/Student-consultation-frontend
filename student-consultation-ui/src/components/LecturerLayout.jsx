import { Outlet, NavLink } from "react-router-dom";
import LecturerHeader from "./LecturerHeader";

export default function LecturerLayout() {
    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <div className="bg-dark text-white p-3" style={{ width: 250 }}>
                <h5 className="mb-4">Giảng viên</h5>

                <NavLink
                    to="/lecturer/dashboard"
                    className="d-block mb-2 text-white text-decoration-none"
                >
                    📊 Dashboard
                </NavLink>

                <NavLink
                    to="/lecturer/appointments"
                    className="d-block mb-2 text-white text-decoration-none"
                >
                    📅 Lịch hẹn
                </NavLink>

                <NavLink
                    to="/lecturer/profile"
                    className="d-block text-white text-decoration-none"
                >
                    👤 Hồ sơ
                </NavLink>
            </div>

            {/* Content */}
            <div className="flex-grow-1">
                <LecturerHeader />
                <div className="p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
