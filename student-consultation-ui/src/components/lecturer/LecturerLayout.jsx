import { Outlet, NavLink } from "react-router-dom";
import LecturerHeader from "./LecturerHeader";

export default function LecturerLayout() {
    return (
        <div className="d-flex vh-100 overflow-hidden">
            
            {/* Sidebar giữ nguyên */}
            <div 
                className="bg-dark text-white p-3 flex-shrink-0 d-flex flex-column" 
                style={{ width: 250, height: "100%" }}
            >
                <h5 className="mb-4">Giảng viên</h5>

                <NavLink
                    to="/lecturer/dashboard"
                    className={({ isActive }) => 
                        `d-block mb-2 text-decoration-none ${isActive ? "text-warning fw-bold" : "text-white"}`
                    }
                >
                    📊 Dashboard
                </NavLink>

                <NavLink
                    to="/lecturer/appointments"
                    className={({ isActive }) => 
                        `d-block mb-2 text-decoration-none ${isActive ? "text-warning fw-bold" : "text-white"}`
                    }
                >
                    📅 Lịch hẹn
                </NavLink>

                <NavLink
                    to="/lecturer/profile"
                    className={({ isActive }) => 
                        `d-block text-decoration-none ${isActive ? "text-warning fw-bold" : "text-white"}`
                    }
                >
                    👤 Hồ sơ
                </NavLink>
            </div>

            {/* Content Area */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                
                {/* 🛠️ SỬA Ở ĐÂY: Bọc Header trong div có z-index cao và position relative */}
                {/* Điều này giúp Menu thả xuống luôn NỔI LÊN TRÊN phần nội dung bên dưới */}
                <div style={{ position: "relative", zIndex: 1000 }}>
                    <LecturerHeader />
                </div>

                {/* Phần nội dung cuộn bên dưới */}
                <div className="p-4 flex-grow-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}