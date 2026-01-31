import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Đăng xuất khỏi trang quản trị?")) {
            localStorage.clear();
            navigate("/login");
        }
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark vh-100" style={{ width: "260px" }}>
            <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <i className="bi bi-shield-lock-fill fs-2 me-2 text-warning"></i>
                <span className="fs-4 fw-bold">Trang quản trị</span>
            </div>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                {/* --- NHÓM QUẢN TRỊ CHÍNH --- */}
                <li className="nav-item mb-2">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-speedometer2 me-2"></i> Tổng quan (Dashboard)
                    </NavLink>
                </li>

                {/* 🔥 MỚI: THỐNG KÊ CHI TIẾT */}
                <li className="nav-item mb-2">
                    <NavLink to="/admin/statistics" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-bar-chart-line-fill me-2"></i> Báo cáo & Thống kê
                    </NavLink>
                </li>

                <li className="nav-item mb-2">
                    <NavLink to="/admin/users" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-people-fill me-2"></i> Quản lý Tài khoản
                    </NavLink>
                </li>

                {/* --- NHÓM NGHIỆP VỤ --- */}
                <li className="nav-item mb-2">
                    <NavLink to="/admin/procedures" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-file-earmark-text me-2"></i> Quản lý Thủ tục
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/admin/procedure-requests" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-clipboard-data me-2"></i> Yêu cầu Thủ tục
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/admin/appointments" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-calendar-week me-2"></i> Quản lý Lịch hẹn
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/admin/lecturer-schedules" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-calendar-check me-2"></i> Lịch làm việc GV
                    </NavLink>
                </li>

                <hr className="text-white opacity-50 my-2" />

                {/* --- NHÓM HỆ THỐNG & HỖ TRỢ --- */}
                <li className="nav-item mb-2">
                    <NavLink to="/admin/notifications" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-bell-fill me-2"></i> Thông báo chung
                    </NavLink>
                </li>

                {/* 🔥 MỚI: CẤU HÌNH HỆ THỐNG */}
                <li className="nav-item mb-2">
                    <NavLink to="/admin/settings" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-gear-fill me-2"></i> Cấu hình hệ thống
                    </NavLink>
                </li>

                <li className="nav-item mb-2">
                    <NavLink to="/admin/logs" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-clock-history me-2"></i> Nhật ký hoạt động
                    </NavLink>
                </li>
            </ul>
            <hr />
            <div className="dropdown">
                <button className="btn btn-outline-light w-100 text-start d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                </button>
            </div>
        </div>
    );
}