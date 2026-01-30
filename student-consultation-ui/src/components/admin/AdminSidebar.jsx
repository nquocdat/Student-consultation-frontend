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
                <li className="nav-item mb-2">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-speedometer2 me-2"></i> Tổng quan
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/admin/users" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-people-fill me-2"></i> Quản lý Tài khoản
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/admin/procedures" className={({ isActive }) => `nav-link text-white ${isActive ? "active bg-primary" : ""}`}>
                        <i className="bi bi-file-earmark-text me-2"></i> Quản lý Thủ tục
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